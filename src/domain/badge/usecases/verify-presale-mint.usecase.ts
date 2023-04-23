import { BadgeEventType } from '../dtos/badge-event.dto';
import { PreSaleEventType } from '../dtos/presale-event.dto';
import { VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';
import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { FetchableBadgeEventPort } from '../ports/fetchable-badge-event.port';
import { FetchablePresaleEventPort } from '../ports/fetchable-presale-event.port';

export class VerifyPreSaleMintUseCase implements VerifyMintInteractor {
  constructor(
    readonly fetchablePresaleEventPort: FetchablePresaleEventPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute({
    cryoptoWallet,
  }: VerifyMintRequestDto): Promise<VerifyMintResponseDto> {
    const [preSaleEvents, badgeEvents] = await Promise.all([
      this.fetchablePresaleEventPort.fetch(
        cryoptoWallet,
        PreSaleEventType.CLAIM,
        PreSaleEventType.PURCHASE,
      ),
      this.fetchableBadgeEventPort.fetch(cryoptoWallet, BadgeEventType.MINT),
    ]);

    let isVerified =
      Boolean(preSaleEvents.length) && !Boolean(badgeEvents.length);

    const result: VerifyMintResponseDto = {
      isVerified,
      amount: Number(isVerified),
    };

    return result;
  }
}
