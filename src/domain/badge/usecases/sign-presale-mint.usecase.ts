import { SignMintRequestDto } from '../dtos/sign-mint-request.dto';
import { SignedMintResponseDto } from '../dtos/signed-mint-response.dto';
import { MintHistory } from '../entities/mint-history.entity';
import { SignMintInteractor } from '../interactors/sign-mint.interactor';
import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { PersistableMintHistoryPort } from '../ports/persistable-mint-history.port';
import {
  SignaturePayload,
  SignaturePort,
} from '../../common/ports/signature.port';

import { Settings } from '../../common/settings';
import { SignerType } from '../../common/enums/signer-type.enum';
import { Chain } from '../../common/entities/chain.entity';
import { LayerType } from '../../common/enums/layer-type.enum';

const typeHash = {
  [LayerType.L1]:
    'Mint(address to, uint16 id, uint256 amount, uint16 incremental, uint256 dueDate, uint256 nonce)',
  [LayerType.L2]:
    'Mint(address to, uint16 id, uint256 amount, uint16 incremental, uint256 dueDate, uint256 nonce, uint256 chainId)',
};

const amount = 1;
const incremental = 1;

const signatureExpiration = 60 * 60 * 1000; // 1h
export class SignPreSaleMintUseCase implements SignMintInteractor {
  constructor(
    readonly settings: Settings,
    readonly verifyMintInteractor: VerifyMintInteractor,
    readonly persistableMintHistoryPort: PersistableMintHistoryPort,
    readonly signaturePort: SignaturePort,
  ) {}

  async execute({
    cryptoWallet,
    chainId,
    clientIp,
    clientAgent,
  }: SignMintRequestDto): Promise<SignedMintResponseDto> {
    const { referenceMetadataId } = this.settings.badge.presale;

    const chain = new Chain(chainId);

    let verifyResult = await this.verifyMintInteractor.execute({
      cryptoWallet,
      chain,
    });

    if (!verifyResult.isVerified) {
      const history = new MintHistory({
        referenceMetadataId,
        cryptoWallet,
        amount,
        description: 'Not verified',
        valid: verifyResult.isVerified,
        chainId: chain.id,
        clientIp,
        clientAgent,
      });

      await this.persistableMintHistoryPort.create(history);

      throw new Error(history.description);
    }

    const dueDate =
      verifyResult.dueDate ?? new Date(Date.now() + signatureExpiration);

    await this.persistableMintHistoryPort.create(
      new MintHistory({
        referenceMetadataId,
        cryptoWallet,
        amount,
        description: `${amount}x of #${referenceMetadataId} verified and signed`,
        valid: verifyResult.isVerified,
        chainId: chain.id,
        dueDate,
        clientIp,
        clientAgent,
      }),
    );

    verifyResult = await this.verifyMintInteractor.execute({
      cryptoWallet,
      chain,
    });

    if (!verifyResult.isVerified) {
      await this.execute({
        cryptoWallet,
        referenceMetadataId,
        chainId: chain.id,
        clientIp,
        clientAgent,
      });
    }

    const dueDateInUTCEpoch = Math.floor(verifyResult.dueDate.getTime() / 1000);

    const mintTypeHash = this.signaturePort.hash(typeHash[chain.layer]);

    const payload: SignaturePayload = {
      types: ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
      values: [
        mintTypeHash,
        cryptoWallet,
        referenceMetadataId,
        amount,
        incremental,
        dueDateInUTCEpoch,
      ],
    };

    const { signature, nonce } = await this.signaturePort.sign(
      payload,
      SignerType.BadgesMinter,
      new Chain(verifyResult.chainId),
    );

    const result: SignedMintResponseDto = {
      cryptoWallet,
      referenceMetadataId,
      amount,
      signature,
      incremental,
      nonce,
      dueDate: dueDateInUTCEpoch,
      switchChainsDate: verifyResult.switchChainsDate,
      onHold: verifyResult.onHold,
    };

    return result;
  }
}
