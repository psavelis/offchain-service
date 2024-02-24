import { getCurrentDateString, getDowntime } from '../../../common/date-util';
import { type EncryptionPort } from '../../../common/ports/encryption.port';
import { type LoggablePort } from '../../../common/ports/loggable.port';
import { type Settings } from '../../../common/settings';
import { type AuditPoolEvent } from '../entities/audit-pool-event.entity';
import { type ImportPoolEventsInteractor } from '../interactors/import-pool-events.interactor';
import { type FetchableAuditPoolStoredEventPort } from '../ports/fetchable-audit-pool-event.port';
import { type FetchableOnChainAuditPoolEventPort } from '../ports/fetchable-onchain-audit-pool-event.port';
import { type PersistableAuditPoolEventPort } from '../ports/persistable-audit-pool-event.port';

export class ImportPoolEventsUseCase implements ImportPoolEventsInteractor {
  disconnected: Date | undefined = null;

  constructor(
    readonly logger: LoggablePort,
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
    readonly fetchableAuditPoolStoredEventPort: FetchableAuditPoolStoredEventPort,
    readonly fetchableOnChainAuditPoolEventPort: FetchableOnChainAuditPoolEventPort,
    readonly persistableAuditPoolEventPort: PersistableAuditPoolEventPort,
  ) {}

  async execute(): Promise<void> {
    try {
      const { ethereumLastBlock, polygonLastBlock } =
        await this.fetchableAuditPoolStoredEventPort.fetchLastBlocks();

      const auditPoolEvents: AuditPoolEvent[] =
        await this.fetchableOnChainAuditPoolEventPort.fetchByBlockNumber(
          ethereumLastBlock,
          polygonLastBlock,
        );

      if (!auditPoolEvents?.length) {
        this.disconnected = null;
        return;
      }

      const errors: number = await this.processPoolEvents(auditPoolEvents);

      if (errors) {
        this.logger.warn(
          `[import-pool] ${auditPoolEvents.length - errors}/${
            auditPoolEvents.length
          } suceeded. ${errors} aborted`,
        );

        return;
      }

      if (this.disconnected) {
        const format = getDowntime(this.disconnected);

        this.logger.info(
          `[import-pool] Alchemy API back up. (downtime: ${format})`,
        );
      }

      this.disconnected = null;

      this.logger.info(
        `[import-pool] ${auditPoolEvents.length} events imported successfully`,
      );
    } catch (err) {
      if (this.disconnected) {
        const datept = getCurrentDateString(this.disconnected);

        if (
          this.disconnected >
          new Date(this.disconnected.getTime() - 1000 * 60 * 30)
        )
          this.logger.warn(
            `[import-pool] No response from Alchemy API... (since: ${datept} GMT-3)`,
          );

        return;
      }

      this.disconnected = new Date();
    }
  }

  private async processPoolEvents(
    auditPoolEvents: AuditPoolEvent[],
  ): Promise<number> {
    const errorCount = 0;

    for (const event of auditPoolEvents) {
      try {
        const exists =
          await this.fetchableAuditPoolStoredEventPort.fetchByFingerprint(
            await event.getFingerprint(this.encryptionPort, this.settings),
          );

        if (exists) {
          console.debug(
            `[import-pool][block-overlap] skipping already imported ${event.getChainId()} - ${event.getTransactionHash()}`,
          );

          continue;
        }

        await this.persistableAuditPoolEventPort.create(event);
      } catch (err) {
        console.error(
          `[import-pool][error][${errorCount}@${
            auditPoolEvents.indexOf(event) + 1
          }] Error#${errorCount} ${event.getTransactionHash()}@${event.getChainId()} ${JSON.stringify(
            {
              msg: err.message,
              stack: err.stack,
            },
          )}`,
        );
      }
    }

    return errorCount;
  }
}
