import { Purchase } from '../entities/purchase.entity';
import { ImportPurchasesInteractor } from '../interactors/import-purchases.interactor';
import { FetchableOnChainPurchaseEventPort } from '../ports/fetchable-onchain-purchase-event.port';
import { FetchablePurchasePort } from '../ports/fetchable-purchase.port';
import { PersistablePurchasePort } from '../ports/persistable-purchase.port';
import { LoggablePort } from '../../common/ports/loggable.port';

export class ImportPurchasesUseCase implements ImportPurchasesInteractor {
  constructor(
    readonly logger: LoggablePort,
    readonly fetchablePurchasePort: FetchablePurchasePort,
    readonly fetchablOnChainPurchaseEventPort: FetchableOnChainPurchaseEventPort,
    readonly persistablePurchasePort: PersistablePurchasePort,
  ) {}

  async execute(): Promise<void> {
    try {
      const { ethereumLastBock, polygonLastBlock } =
        await this.fetchablePurchasePort.fetchLastBlocks();

      const purchases: Purchase[] =
        await this.fetchablOnChainPurchaseEventPort.fetchByBlockNumber(
          ethereumLastBock,
          polygonLastBlock,
        );

      if (!purchases?.length) {
        return;
      }

      const errors: number = await this.processPurchase(purchases);

      if (errors) {
        this.logger.warning(
          `[import-purchases] ${purchases.length - errors}/${
            purchases.length
          } suceeded. ${errors} aborted`,
        );

        return;
      }

      this.logger.info(
        `[import-purchases] ${purchases.length - errors}/${
          purchases.length
        } suceeded!`,
      );
    } catch (err) {
      this.logger.error(err, '[import-purchases][aborted]');
    }
  }

  private async processPurchase(purchases: Purchase[]): Promise<number> {
    const errorCount = 0;

    for (const purchase of purchases) {
      try {
        const exists = await this.fetchablePurchasePort.fetchByTransactionHash(
          purchase.purchaseTransactionHash,
        );

        if (
          exists?.purchaseTransactionHash === purchase.purchaseTransactionHash
        ) {
          console.info(
            `[import-purchases][block-overlap] skipping already imported ${purchase.network} purchase: ${purchase.purchaseTransactionHash}`,
          );

          continue;
        }

        await this.persistablePurchasePort.create(purchase);
      } catch (err) {
        console.error(
          `[import-purchases][error][${errorCount}@${
            purchases.indexOf(purchase) + 1
          }] Error#${errorCount} ${purchase.purchaseTransactionHash}@${
            purchase.network
          } ${JSON.stringify({
            msg: err.message,
            stack: err.stack,
          })}`,
        );
      }
    }

    return errorCount;
  }
}
