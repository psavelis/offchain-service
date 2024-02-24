import { getCurrentDateString, getDowntime } from '../../../common/date-util';
import { type EncryptionPort } from '../../../common/ports/encryption.port';
import { type LoggablePort } from '../../../common/ports/loggable.port';
import { type Settings } from '../../../common/settings';
import { RoleBuilder } from '../../identity/authentication/builders/role.builder';
import { RoleType } from '../../identity/authentication/enums/role-type.enum';
import { type GenerateFingerprintInteractor } from '../../identity/authentication/interactors/generate-fingerprint.interactor';
import { type PersistableRolePort } from '../../identity/authentication/ports/persistable-role.port';
import { type AuditPoolEvent } from '../entities/audit-pool-event.entity';
import { type FetchableAuditPoolStoredEventPort } from '../ports/fetchable-audit-pool-event.port';

import { type FetchableRolePort } from '../../identity/authentication/ports/fetchable-role.port';
import { AuditPoolEventType } from '../enums/audit-pool-event.enum';

export class GenerateAuditFingerprintUseCase
  implements GenerateFingerprintInteractor
{
  disconnected: Date | undefined = null;
  roleTypesByEventMap: Partial<Record<AuditPoolEventType, RoleType>> = {};

  constructor(
    readonly logger: LoggablePort,
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
    readonly fetchableRolePort: FetchableRolePort,
    readonly fetchableAuditPoolStoredEventPort: FetchableAuditPoolStoredEventPort,
    readonly persistableRolePort: PersistableRolePort,
  ) {
    this.roleTypesByEventMap = {
      [AuditPoolEventType.NEW_STAKE]: RoleType.IMPACT_CULTIVATION_VALIDATOR,
    };
  }

  async execute(): Promise<void> {
    try {
      const { ethereumLastBlock, polygonLastBlock } =
        await this.fetchableRolePort.fetchLastBlocks();

      const auditPoolEvents: AuditPoolEvent[] =
        await this.fetchableAuditPoolStoredEventPort.fetchByBlockNumber(
          ethereumLastBlock,
          polygonLastBlock,
        );

      if (!auditPoolEvents?.length) {
        this.disconnected = null;
        return;
      }

      const errors: number = await this.processPoolEvent(auditPoolEvents);

      if (errors) {
        this.logger.warn(
          `[pool-fingerprint] ${auditPoolEvents.length - errors}/${
            auditPoolEvents.length
          } suceeded. ${errors} aborted`,
        );

        return;
      }

      if (this.disconnected) {
        const downtime = getDowntime(this.disconnected);

        this.logger.info(
          `[pool-fingerprint] Fingerprint server back up. (downtime: ${downtime})`,
        );
      }

      this.disconnected = null;
    } catch (err) {
      if (this.disconnected) {
        const datept = getCurrentDateString(this.disconnected);

        if (
          this.disconnected >
          new Date(this.disconnected.getTime() - 1000 * 60 * 30)
        )
          this.logger.warn(
            `[pool-fingerprint] Fingerprint server OFFLINE... (since: ${datept} GMT-3)`,
          );

        return;
      }

      this.disconnected = new Date();
    }
  }

  private async processPoolEvent(
    auditPoolEvents: AuditPoolEvent[],
  ): Promise<number> {
    const errorCount = 0;

    for (const event of auditPoolEvents) {
      try {
        const fingerprint = await event.getFingerprint(
          this.encryptionPort,
          this.settings,
        );

        const exists = await this.fetchableRolePort.fetchByFingerprint(
          fingerprint,
        );

        if (exists) {
          console.debug(
            `[pool-fingerprint][block-overlap] skipping already processed ${event.getChainId()} - ${event.getTransactionHash()}`,
          );

          continue;
        }

        const roleType = this.roleTypesByEventMap[event.getEventType()];

        if (!roleType) {
          continue;
        }

        const builder = new RoleBuilder({
          fingerprint,
          chainId: event.getChainId(),
          transactionHash: event.getTransactionHash(),
          userIdentifier: event.getUserIdentifier(),
        }).withRoleType(roleType);

        const newRoleEntity = await this.persistableRolePort.create(
          builder.build(),
        );

        // TODO: verificar se fez unstake algo assim

        console.warn(
          `[pool-fingerprint][role-created] FGP:${fingerprint}, ${newRoleEntity.getRoleType()}@${newRoleEntity.getChainId()} ${newRoleEntity.getTransactionHash()}`,
        );
      } catch (err) {
        console.error(
          `[pool-fingerprint][error][${errorCount}@${
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
