import { FetchAggregatedSignatureUseCase } from '../../../../domain/badge/usecases/fetch-aggregated-signature.usecase';
import { VerifyAggregatedBadgeMintFactory } from './verify-aggregated-badge-mint.factory';
import { SignAggregatedMintFactory } from './sign-aggregated-mint.factory';
export class FetchAggregatedSignatureFactory {
  static instance: FetchAggregatedSignatureUseCase;

  static getInstance(): FetchAggregatedSignatureUseCase {
    if (!this.instance) {
      const verifyAggregatedMintUseCase =
        VerifyAggregatedBadgeMintFactory.getInstance();
      const signAggregatedMintUseCase = SignAggregatedMintFactory.getInstance();

      this.instance = new FetchAggregatedSignatureUseCase(
        signAggregatedMintUseCase,
        verifyAggregatedMintUseCase,
      );
    }

    return this.instance;
  }
}
