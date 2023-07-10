import { Settings } from '../../common/settings';

import { BadgeEventType } from '../dtos/badge-event.dto';
import { PreSaleEventType } from '../dtos/presale-event.dto';

import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { FetchableBadgeEventPort } from '../ports/fetchable-badge-event.port';
import { FetchablePreSaleEventPort } from '../ports/fetchable-presale-event.port';

import { VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';
import { cryptoWalletRegEx } from '../../common/util';
import { FetchableMintHistoryPort } from './../ports/fetchable-mint-history.port';

const blockSecurityInterval = 900 * 1000;

export class VerifyPreSaleMintUseCase implements VerifyMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly fetchablePresaleEventPort: FetchablePreSaleEventPort,
    readonly fetchableBadgeEventPort: FetchableBadgeEventPort,
    readonly fetchableMintHistoryPort: FetchableMintHistoryPort,
  ) {}

  async execute({
    cryptoWallet,
    chain,
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

    const lastSignatureHistory = await this.fetchableMintHistoryPort.fetchLast(
      cryptoWallet,
      referenceMetadataId,
    );

    const current = new Date();

    const lastSignatureDueDate =
      lastSignatureHistory?.dueDate > current
        ? lastSignatureHistory.dueDate
        : undefined;

    const switchChainsDate = lastSignatureDueDate
      ? new Date(lastSignatureDueDate.getTime() + blockSecurityInterval)
      : undefined;

    const dueDate =
      switchChainsDate > current ? lastSignatureDueDate : undefined;

    const result: VerifyMintResponseDto = {
      referenceMetadataId,
      isVerified,
      amount: Number(isVerified),
      dueDate,
      chainId: dueDate ? lastSignatureHistory.chainId : chain.id,
      switchChainsDate,
      onHold: dueDate && dueDate < current && switchChainsDate > current,
    };

    return result;
  }
}
