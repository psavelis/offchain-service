import { Chain } from '../../common/entities/chain.entity';
import { type LoggablePort } from '../../common/ports/loggable.port';
import { type TransitionInfo } from '../../order/dtos/transition-info.dto';
import { OrderStatus, type Order } from '../../order/entities/order.entity';
import { type CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { type OnchainDelegateClaimEvent } from '../../supply/dtos/onchain-delegate-claim-event.dto';
import { type OnChainUserReceipt } from '../../supply/dtos/onchain-user-receipt.dto';
import { type ReconcileDelegateSignatureClaimInteractor } from '../../supply/interactors/reconcile-delegate-signature-claim.interactor';
import { type ImportReconciledClaimsInteractor } from '../interactors/import-reconciled-claims.interactor';
import { type PersistableClaimReceiptPort } from '../ports/persistable-claim-receipt.port';

export class ImportReconciledClaimsUseCase
  implements ImportReconciledClaimsInteractor
{
  constructor(
    readonly logger: LoggablePort,
    readonly reconcileDelegateClaims: ReconcileDelegateSignatureClaimInteractor,
    readonly createOrderTransition: CreateOrderTransitionInteractor,
    readonly persistableClaimReceiptPort: PersistableClaimReceiptPort,
  ) {}

  async execute(): Promise<void> {
    const results = await this.reconcileDelegateClaims.execute();
    let errorCount = 0;

    for (const { order, userReceipt } of results) {
      try {
        const success = await this.importReconciledClaim(order, userReceipt);

        if (!success) {
          errorCount++;
        }
      } catch (err) {
        this.displayFailure(err, order, userReceipt);
      }
    }

    this.displaySummary(results, errorCount);
  }

  async importReconciledClaim(
    order: Order,
    userReceipt: OnChainUserReceipt,
  ): Promise<boolean> {
    try {
      await this.persistableClaimReceiptPort.create(order, userReceipt);

      order.setStatus(OrderStatus.Claimed);

      const info: TransitionInfo = {
        reason: 'Claim imported from blockchain',
        pastDue: userReceipt.pastDue,
      };

      await this.createOrderTransition.execute(order, info);

      return true;
    } catch (err) {
      console.error(
        `[import-reconciled-claim]: #${order.getPaymentSequence()}=>${
          err.message
        }`,
      );

      return false;
    }
  }

  private displayFailure(
    err: Error,
    order: Order,
    userReceipt: OnChainUserReceipt,
  ) {
    this.logger.error(
      err,
      `Failed to import reconciled claim for order ${order.getId()} (#${order.getPaymentSequence()}). Transaction: ${new Chain(
        userReceipt.chainId,
      ).getBlockExplorerUrl(userReceipt.transactionHash)}`,
    );
  }

  private displaySummary(
    results: OnchainDelegateClaimEvent[],
    errorCount: number,
  ) {
    if (results?.length > 0) {
      const resultMessage = `${results.length} claims reconciled.${
        errorCount > 0 ? ` ${errorCount} errors.` : ''
      }`;

      if (errorCount === 0) {
        this.logger.info(resultMessage);
      } else {
        this.logger.warn(resultMessage);
      }

      this.displayAnalysisMessage(resultMessage, results);
    }
  }

  private displayAnalysisMessage(
    resultMessage: string,
    results: OnchainDelegateClaimEvent[],
  ) {
    const details = results.reduce((record, { order, userReceipt }) => {
      record[`#${order.getPaymentSequence()}`] = `${new Chain(
        userReceipt.chainId,
      ).getBlockExplorerUrl(userReceipt.transactionHash)}`;

      return record;
    }, {});

    console.info(resultMessage, JSON.stringify(details));
  }
}
