import { Settings } from '../../../common/settings';
import { FetchBadgeEligibilityResponseDto } from '../../dtos/fetch-badge-eligibility-response.dto';
import { cryptoWalletRegEx } from '../../../common/util';
import { FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { BadgeEventType } from '../../dtos/badge-event.dto';
import { FetchableAuditPoolEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-event.port';
import {
  AuditPoolEvent,
  AuditPoolEventType,
} from '../../dtos/impactful-cultivation/auditpool-event.dto';
import { FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';

export class FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase {
  static cachedAlreadyMinted: Record<string, boolean> = {};
  static cachedInitializedEvent: AuditPoolEvent | undefined;

  constructor(
    readonly settings: Settings,
    readonly fetchableAuditPoolEventPort: FetchableAuditPoolEventPort,
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

    if (Boolean(badgeEvents.length)) {
      FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.cachedAlreadyMinted[
        cryptoWallet
      ] = true;

      return;
    }

    const stakedBeforeInitialized = stakeEvents.some(
      (event: AuditPoolEvent) =>
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
      return;
    }

    return {
      referenceMetadataId,
      amount: 1,
    };
  }
}
