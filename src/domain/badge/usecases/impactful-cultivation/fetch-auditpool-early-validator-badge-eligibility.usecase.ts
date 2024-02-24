import { type Settings } from '../../../common/settings';
import { cryptoWalletRegEx } from '../../../common/util';
import { AuditPoolEventType } from '../../../upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';
import { BadgeEventType } from '../../dtos/badge-event.dto';
import { type FetchBadgeEligibilityResponseDto } from '../../dtos/fetch-badge-eligibility-response.dto';
import { type FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { type FetchableAuditPoolRemoteEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-remote-event.port';
import { type FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';

import { type AuditPoolRemoteEventDto } from '../../../upstream-domains/impactful-cultivation/dtos/audit-pool-remote-event.dto';

export class FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase {
  static cachedAlreadyMinted: Record<string, boolean> = {};
  static cachedInitializedEvent: AuditPoolRemoteEventDto | undefined;

  constructor(
    readonly settings: Settings,
    readonly fetchableAuditPoolEventPort: FetchableAuditPoolRemoteEventPort,
    readonly fetchableAuditPoolStakesPort: FetchableAuditPoolStakesPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute(
    cryptoWallet: string,
  ): Promise<FetchBadgeEligibilityResponseDto | undefined> {
    if (!cryptoWallet.match(cryptoWalletRegEx)) {
      throw new Error('invalid wallet address');
    }

    const { referenceMetadataId } =
      this.settings.badge.impactfulCultivation.auditPoolEarlyValidator;

    if (
      FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedAlreadyMinted[
        cryptoWallet
      ]
    ) {
      return;
    }

    if (
      !FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedInitializedEvent
    ) {
      const [auditPoolInitializedEvent] =
        await this.fetchableAuditPoolEventPort.fetch(
          cryptoWallet,
          AuditPoolEventType.INITIALIZED,
        );

      FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedInitializedEvent =
        auditPoolInitializedEvent;
    }

    const [stakeEvents, badgeEvents] = await Promise.all([
      this.fetchableAuditPoolEventPort.fetch(
        cryptoWallet,
        AuditPoolEventType.NEW_STAKE,
      ),
      this.fetchableBadgeEventPort.fetch(
        cryptoWallet,
        referenceMetadataId,
        BadgeEventType.MINT,
      ),
    ]);

    if (badgeEvents.length) {
      FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedAlreadyMinted[
        cryptoWallet
      ] = true;

      return;
    }

    const stakedBeforeInitialized = stakeEvents.some(
      (event: AuditPoolRemoteEventDto) =>
        event.blockTimestamp &&
        FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase
          .cachedInitializedEvent?.blockTimestamp &&
        event.blockTimestamp <
          FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase
            .cachedInitializedEvent?.blockTimestamp,
    );

    const eligible =
      (!FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedInitializedEvent &&
        stakeEvents.length) ||
      stakedBeforeInitialized;

    if (!eligible && !stakeEvents.length) {
      // todo: temporario, precisa definir data de corte
      // TODO: DEPRECAR
      return;
    }

    return {
      referenceMetadataId,
      amount: 1,
    };
  }
}
