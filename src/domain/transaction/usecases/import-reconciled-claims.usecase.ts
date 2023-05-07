import { OnchainDelegateClaimEvent } from '../../supply/dtos/onchain-delegate-claim-event.dto';
import { ReconcileDelegateSignatureClaimInteractor } from '../../supply/interactors/reconcile-delegate-signature-claim.interactor';
import { ImportReconciledClaimsInteractor } from '../interactors/import-reconciled-claims.interactor';
import { CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { TransitionInfo } from '../../order/dtos/transition-info.dto';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { OnChainUserReceipt } from '../../supply/dtos/onchain-user-receipt.dto';
import { LoggablePort } from '../../common/ports/loggable.port';
import { Chain } from '../../common/entities/chain.entity';

export class ImportReconciledClaimsUseCase
  implements ImportReconciledClaimsInteractor
{
  constructor(
    readonly logger: LoggablePort,
    readonly reconcileDelegateClaims: ReconcileDelegateSignatureClaimInteractor,
    readonly createOrderTransition: CreateOrderTransitionInteractor,
  ) {}

  async execute(): Promise<void> {
    const results = await this.reconcileDelegateClaims.execute();

    for (const { order, userReceipt } of results) {
      try {
        await this.importReconciledClaim(order, userReceipt);
      } catch (err) {
        this.logger.error(
          err,
          `Failed to import reconciled claim for order ${order.getId()} (#${order.getPaymentSequence()}). Transaction: ${new Chain(
            userReceipt.chainId,
          ).getBlockExplorerUrl(userReceipt.transactionHash)}`,
        );
      }
    }

    if (results?.length > 0) {
      this.logger.info(
        `${results.length} claims reconciled.`,
        results.reduce((record, { order, userReceipt }) => {
          record[`#${order.getPaymentSequence()}`] = `${new Chain(
            userReceipt.chainId,
          ).getBlockExplorerUrl(userReceipt.transactionHash)}`;

          return record;
        }, {} as Record<string, string>),
      );
    }
  }

  async importReconciledClaim(order: Order, userReceipt: OnChainUserReceipt) {
    // await this.persistableClaimReceiptPort.create(order, userReceipt);
    // TODO: @@@ insert receipt (check if exists before insert)
    // TODO: @@@ update claim with inserted receipt (fetch and check to see if theres a different receipt)

    order.setStatus(OrderStatus.Claimed);

    // const info: TransitionInfo = {
    //   reason: 'Claim imported from blockchain',
    //   pastDue: userReceipt.pastDue,
    // };

    // await this.createOrderTransition.execute(order, info);
  }
}
