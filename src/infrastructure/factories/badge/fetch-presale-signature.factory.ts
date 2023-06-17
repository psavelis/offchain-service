import { FetchPreSaleSignatureUseCase } from '../../../domain/badge/usecases/fetch-presale-signature.usecase';
import { VerifyPreSaleMintFactory } from './verify-presale-mint.factory';
import { SignPreSaleMintFactory } from './sign-presale-mint.factory';

export class FetchPreSaleSignatureFactory {
  static instance: FetchPreSaleSignatureUseCase;

  static getInstance(): FetchPreSaleSignatureUseCase {
    if (!this.instance) {
      const verifyPreSaleMintUseCase = VerifyPreSaleMintFactory.getInstance();
      const signPreSaleMintUseCase = SignPreSaleMintFactory.getInstance();

      this.instance = new FetchPreSaleSignatureUseCase(
        signPreSaleMintUseCase,
        verifyPreSaleMintUseCase,
      );
    }

    return this.instance;
  }
}
