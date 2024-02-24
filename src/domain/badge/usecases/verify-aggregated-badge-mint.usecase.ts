import { type Settings } from '../../common/settings';
import { cryptoWalletRegEx } from '../../common/util';
import { type VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { type VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';
import { type VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { type FetchableMintHistoryPort } from '../ports/fetchable-mint-history.port';
import { type FetchAggregatedBadgeEligibilityUseCase } from './fetch-aggregated-badge-eligibility.usecase';
const blockSecurityInterval = 900 * 1000;

export class VerifyAggregatedBadgeMintUseCase implements VerifyMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly fetchableMintHistoryPort: FetchableMintHistoryPort,
    readonly fetchAggregatedBadgeEligibilityUseCase: FetchAggregatedBadgeEligibilityUseCase,
  ) {}

  async execute({
    cryptoWallet,
    referenceMetadataId,
    chain,
  }: VerifyMintRequestDto): Promise<VerifyMintResponseDto> {
    if (!cryptoWallet.match(cryptoWalletRegEx)) {
      throw new Error('invalid wallet address');
    }

    const eligibilityResult =
      await this.fetchAggregatedBadgeEligibilityUseCase.executeSingle(
        cryptoWallet,
        referenceMetadataId,
      );

    const isVerified = (eligibilityResult?.amount ?? 0) > 0;

    const lastSignatureHistory = await this.fetchableMintHistoryPort.fetchLast(
      cryptoWallet,
      referenceMetadataId,
    );

    const current = new Date();

    const lastSignatureDueDate =
      (lastSignatureHistory?.dueDate ?? new Date(0)) > current
        ? lastSignatureHistory.dueDate
        : undefined;

    const switchChainsDate = lastSignatureDueDate
      ? new Date(lastSignatureDueDate.getTime() + blockSecurityInterval)
      : undefined;

    const dueDate =
      (switchChainsDate ?? new Date(0)) > current
        ? lastSignatureDueDate
        : undefined;

    const result: VerifyMintResponseDto = {
      referenceMetadataId,
      isVerified,
      amount: Number(isVerified),
      dueDate,
      chainId: dueDate ? lastSignatureHistory.chainId : chain.id,
      switchChainsDate,
      onHold: Boolean(
        dueDate &&
          dueDate < current &&
          (switchChainsDate ?? new Date(0)) > current,
      ),
    };

    return result;
  }
}
