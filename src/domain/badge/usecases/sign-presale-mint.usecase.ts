import { SignMintRequestDto } from '../dtos/sign-mint-request.dto';
import { SignedMintResponseDto } from '../dtos/signed-mint-response.dto';
import { MintHistory } from '../entities/mint-history.entity';
import { SignMintInteractor } from '../interactors/sign-mint.interactor';
import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { PersistableMintHistoryPort } from '../ports/persistable-mint-history.port';
import {
  SignaturePayload,
  SignaturePort,
  SignerType,
} from '../../common/ports/signature.port';

import { Settings } from '../../common/settings';

const mintType =
  'Mint(address to, uint256 id, uint256 amount, uint256 incremental, uint256 nonce)';

const amount = 1;
const incremental = 1;

export class SignPreSaleMintUseCase implements SignMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly verifyMintInteractor: VerifyMintInteractor,
    readonly persistableMintHistoryPort: PersistableMintHistoryPort,
    readonly signaturePort: SignaturePort,
  ) {}

  async execute({
    cryptoWallet,
  }: SignMintRequestDto): Promise<SignedMintResponseDto> {
    const referenceMetadataId = this.settings.badge.presale.referenceMetadataId;

    const verifyResult = await this.verifyMintInteractor.execute({
      cryptoWallet,
      referenceMetadataId,
    });

    if (!verifyResult.isVerified) {
      const history = new MintHistory({
        referenceMetadataId,
        cryptoWallet,
        amount,
        description: 'Not verified',
        valid: false,
      });

      await this.persistableMintHistoryPort.create(history);

      throw new Error(history.reason);
    }

    const mintTypeHash = this.signaturePort.hash(mintType);
    const payload: SignaturePayload = {
      types: ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
      values: [mintTypeHash, referenceMetadataId, cryptoWallet, 1, 1],
    };

    const { signature, nonce } = await this.signaturePort.sign(
      payload,
      SignerType.BadgesMinter,
    );

    const result: SignedMintResponseDto = {
      cryptoWallet,
      referenceMetadataId,
      amount,
      signature,
      incremental,
      nonce,
    };

    await this.persistableMintHistoryPort.create(
      new MintHistory({
        referenceMetadataId,
        cryptoWallet,
        amount,
        description: `#${result.incremental} verified and signed for ${amount}x`,
        valid: false,
      }),
    );

    return result;
  }
}
