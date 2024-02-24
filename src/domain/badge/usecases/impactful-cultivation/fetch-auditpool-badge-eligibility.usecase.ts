import { type Settings } from '../../../common/settings';
import { cryptoWalletRegEx } from '../../../common/util';
import { AuditPoolEventType } from '../../../upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';
import { BadgeEventType } from '../../dtos/badge-event.dto';
import { type FetchBadgeEligibilityResponseDto } from '../../dtos/fetch-badge-eligibility-response.dto';
import { type FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { type FetchableAuditPoolRemoteEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-remote-event.port';
import { type FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';

export class FetchAuditPoolBadgeEligibilityUseCase {
  static cachedAlreadyMinted: Record<string, boolean> = {};
  static cachedIsFinalized: boolean;

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

    if (badgeEvents.length) {
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
