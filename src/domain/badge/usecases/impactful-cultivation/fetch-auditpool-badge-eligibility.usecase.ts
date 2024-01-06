import { Settings } from '../../../common/settings';
import { FetchBadgeEligibilityResponseDto } from '../../dtos/fetch-badge-eligibility-response.dto';
import { cryptoWalletRegEx } from '../../../common/util';
import { FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { BadgeEventType } from '../../dtos/badge-event.dto';
import { FetchableAuditPoolEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-event.port';
import { AuditPoolEventType } from '../../dtos/impactful-cultivation/auditpool-event.dto';
import { FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';

export class FetchAuditPoolBadgeEligibilityUseCase {
  static cachedAlreadyMinted: Record<string, boolean> = {};
  static cachedIsFinalized: Boolean;

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
      this.settings.badge.impactfulCultivation.auditPool;

    if (
      FetchAuditPoolBadgeEligibilityUseCase.cachedAlreadyMinted[cryptoWallet]
    ) {
      return;
    }

    if (!FetchAuditPoolBadgeEligibilityUseCase.cachedIsFinalized) {
      const auditPoolFinalizedEvents =
        await this.fetchableAuditPoolEventPort.fetch(
          cryptoWallet,
          AuditPoolEventType.FINALIZED,
        );

      FetchAuditPoolBadgeEligibilityUseCase.cachedIsFinalized = Boolean(
        auditPoolFinalizedEvents.length,
      );
    }

    const [isStaked, badgeEvents] = await Promise.all([
      this.fetchableAuditPoolStakesPort.fetchStakeOf(cryptoWallet),
      this.fetchableBadgeEventPort.fetch(
        cryptoWallet,
        referenceMetadataId,
        BadgeEventType.MINT,
      ),
    ]);

    if (Boolean(badgeEvents.length)) {
      FetchAuditPoolBadgeEligibilityUseCase.cachedAlreadyMinted[cryptoWallet] =
        true;

      return;
    }

    const eligible =
      FetchAuditPoolBadgeEligibilityUseCase.cachedIsFinalized && isStaked;

    if (!eligible) {
      // TODO: verificar se o usuario estava stakado ate o momento da finalizacao (Caso de ter pego a recompensa antes de mintar)
      return;
    }

    return {
      referenceMetadataId,
      amount: 1,
    };
  }
}
