import { Settings } from '../../common/settings';

import { BadgeEventType } from '../dtos/badge-event.dto';
import { PreSaleEventType } from '../dtos/presale-event.dto';

import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { FetchableBadgeEventPort } from '../ports/fetchable-badge-event.port';
import { FetchablePreSaleEventPort } from '../ports/fetchable-presale-event.port';

import { VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';

export class VerifyPreSaleMintUseCase implements VerifyMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly fetchablePresaleEventPort: FetchablePreSaleEventPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
  ) {}

  async execute({
    cryptoWallet: cryoptoWallet,
  }: VerifyMintRequestDto): Promise<VerifyMintResponseDto> {
    const [preSaleEvents, badgeEvents] = await Promise.all([
      this.fetchablePresaleEventPort.fetch(
        cryoptoWallet,
        PreSaleEventType.CLAIM,
        PreSaleEventType.PURCHASE,
      ),
      this.fetchableBadgeEventPort.fetch(
        cryoptoWallet,
        this.settings.badge.presale.referenceMetadataId,
        BadgeEventType.MINT,
      ),
    ]);

    let isVerified =
      Boolean(preSaleEvents.length) && !Boolean(badgeEvents.length);

    const result: VerifyMintResponseDto = {
      isVerified,
      amount: Number(isVerified),
    };

    // TODO: encryptar a carteira, buscar order e ver se foi no contrato de presale? apenas se possuir a importação dos pedidos feito onchain
    // TODO: se não encontrar pedido na base, ir na carteira do usuário e ver se teve transação de compra na presale

    return result;
  }
}
