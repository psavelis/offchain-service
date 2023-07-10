import { Settings } from '../../common/settings';
import { FetchPreSaleBadgeEligibilityResponseDto } from '../dtos/fetch-presale-badge-eligibility-response.dto';
import { FetchablePreSaleEventPort } from '../ports/fetchable-presale-event.port';
import { cryptoWalletRegEx } from '../../common/util';
import { PreSaleEventType } from '../dtos/presale-event.dto';
import { FetchableBadgeEventPort } from '../ports/fetchable-badge-event.port';
import { BadgeEventType } from '../dtos/badge-event.dto';

export class FetchPreSaleBadgeEligibilityUseCase {
  constructor(
    readonly settings: Settings,
    readonly fetchablePresaleEventPort: FetchablePreSaleEventPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute(
    cryptoWallet: string,
  ): Promise<FetchPreSaleBadgeEligibilityResponseDto | undefined> {
    if (!cryptoWallet.match(cryptoWalletRegEx)) {
      throw new Error('invalid wallet address');
    }

    const { referenceMetadataId } = this.settings.badge.presale;

    const [preSaleEvents, badgeEvents] = await Promise.all([
      this.fetchablePresaleEventPort.fetch(
        cryptoWallet,
        PreSaleEventType.CLAIM,
        PreSaleEventType.PURCHASE,
      ),
      this.fetchableBadgeEventPort.fetch(
        cryptoWallet,
        referenceMetadataId,
        BadgeEventType.MINT,
      ),
    ]);

    const eligible =
      Boolean(preSaleEvents.length) && !Boolean(badgeEvents.length);

    if (!eligible) {
      return;
    }

    return {
      referenceMetadataId,
      amount: 1,
    };
  }
}
