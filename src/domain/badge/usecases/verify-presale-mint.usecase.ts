import { Settings } from '../../common/settings';

import { BadgeEventType } from '../dtos/badge-event.dto';
import { PreSaleEventType } from '../dtos/presale-event.dto';

import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { FetchableBadgeEventPort } from '../ports/fetchable-badge-event.port';
import { FetchablePreSaleEventPort } from '../ports/fetchable-presale-event.port';

import { VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';
import { cryptoWalletRegEx } from '../../common/util';

export class VerifyPreSaleMintUseCase implements VerifyMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly fetchablePresaleEventPort: FetchablePreSaleEventPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute({
    cryptoWallet: cryptoWallet,
  }: VerifyMintRequestDto): Promise<VerifyMintResponseDto> {
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

    let isVerified =
      Boolean(preSaleEvents.length) && !Boolean(badgeEvents.length);

    const result: VerifyMintResponseDto = {
      referenceMetadataId,
      isVerified,
      amount: Number(isVerified),
    };

    return result;
  }
}
