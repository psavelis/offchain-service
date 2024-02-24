import {type Settings} from '../../../common/settings';
import {type FetchBadgeEligibilityResponseDto} from '../../dtos/fetch-badge-eligibility-response.dto';
import {type FetchablePreSaleEventPort} from '../../ports/presale/fetchable-presale-event.port';
import {cryptoWalletRegEx} from '../../../common/util';
import {PreSaleEventType} from '../../../upstream-domains/presale/dtos/presale-event.dto';
import {type FetchableBadgeEventPort} from '../../ports/fetchable-badge-event.port';
import {BadgeEventType} from '../../dtos/badge-event.dto';

export class FetchPreSaleBadgeEligibilityUseCase {
  static cachedAlreadyMinted: Record<string, boolean> = {};
  static cachedHasPreSaleEvents: Record<string, boolean> = {};
  constructor(
		readonly settings: Settings,
		readonly fetchablePresaleEventPort: FetchablePreSaleEventPort,
		readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute(
    cryptoWallet: string,
  ): Promise<FetchBadgeEligibilityResponseDto | undefined> {
    if (!cryptoWallet.match(cryptoWalletRegEx)) {
      throw new Error('invalid wallet address');
    }

    let hasAlreadyMinted: boolean | undefined =
      FetchPreSaleBadgeEligibilityUseCase.cachedAlreadyMinted[cryptoWallet];

    if (hasAlreadyMinted) {
      return;
    }

    let hasPreSaleEvents: boolean | undefined =
      FetchPreSaleBadgeEligibilityUseCase.cachedHasPreSaleEvents[cryptoWallet];

    const {referenceMetadataId} = this.settings.badge.presale;

    const preSaleEvents = await (hasPreSaleEvents
      ? Promise.resolve([{type: PreSaleEventType.PURCHASE}])
      : this.fetchablePresaleEventPort.fetch(
        cryptoWallet,
        PreSaleEventType.CLAIM,
        PreSaleEventType.PURCHASE,
      ));

    const badgeEvents = await this.fetchableBadgeEventPort.fetch(
      cryptoWallet,
      referenceMetadataId,
      BadgeEventType.MINT,
    );

    hasAlreadyMinted = FetchPreSaleBadgeEligibilityUseCase.cachedAlreadyMinted[
      cryptoWallet
    ] = Boolean(badgeEvents.length);

    hasPreSaleEvents =
      FetchPreSaleBadgeEligibilityUseCase.cachedHasPreSaleEvents[cryptoWallet] =
        Boolean(preSaleEvents.length);

    const eligible = hasPreSaleEvents && !hasAlreadyMinted;

    if (!eligible) {
      return;
    }

    return {
      referenceMetadataId,
      amount: 1,
    };
  }
}
