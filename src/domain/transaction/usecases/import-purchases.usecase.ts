import { type LoggablePort } from '../../common/ports/loggable.port';
import { type Purchase } from '../entities/purchase.entity';
import { type ImportPurchasesInteractor } from '../interactors/import-purchases.interactor';
import { type FetchableOnChainPurchaseEventPort } from '../ports/fetchable-onchain-purchase-event.port';
import { type FetchablePurchasePort } from '../ports/fetchable-purchase.port';
import { type PersistablePurchasePort } from '../ports/persistable-purchase.port';

export class ImportPurchasesUseCase implements ImportPurchasesInteractor {
  disconnected: Date | undefined = null;

  constructor(
    readonly logger: LoggablePort,
    readonly fetchablePurchasePort: FetchablePurchasePort,
    readonly fetchableOnChainPurchaseEventPort: FetchableOnChainPurchaseEventPort,
    readonly persistablePurchasePort: PersistablePurchasePort,
  ) {}

  async execute(): Promise<void> {
    try {
      const { ethereumLastBlock, polygonLastBlock } =
        await this.fetchablePurchasePort.fetchLastBlocks();

      const purchases: Purchase[] =
        await this.fetchableOnChainPurchaseEventPort.fetchByBlockNumber(
          ethereumLastBlock,
          polygonLastBlock,
        );

      if (!purchases?.length) {
        this.disconnected = null;
        return;
      }

      const errors: number = await this.processPurchase(purchases);

      if (errors) {
        this.logger.warn(
          `[import-purchases] ${purchases.length - errors}/${
            purchases.length
          } suceeded. ${errors} aborted`,
        );

        return;
      }

      if (this.disconnected) {
        const downtime = new Date().getTime() - this.disconnected.getTime();
        const format =
          downtime > 1000 ? `${downtime / 1000}s` : `${downtime}ms`;

        this.logger.info(`Alchemy API back up. (downtime: ${format})`);
      }

      this.disconnected = null;
    } catch (err) {
      if (this.disconnected) {
        const datept = new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'long',
        }).format(new Date(this.disconnected.getTime() - 1000 * 60 * 60 * 3));

        this.logger.warn(
          `No response from Alchemy API... (since: ${datept} GMT-3)`,
        );

        return;
      }

      this.disconnected = new Date();
    }
  }

  private async processPurchase(purchases: Purchase[]): Promise<number> {
    const errorCount = 0;

    for (const purchase of purchases) {
      try {
        const exists = await this.fetchablePurchasePort.fetchByTransactionHash(
          purchase.purchaseTransactionHash,
        );

        if (exists) {
          console.debug(
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
