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
import { NetworkType } from '../../common/enums/network-type.enum';

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
    clientIp,
    clientAgent,
  }: SignMintRequestDto): Promise<SignedMintResponseDto> {
    const { referenceMetadataId } = this.settings.badge.presale;

    const verifyResult = await this.verifyMintInteractor.execute({
      cryptoWallet,
    });

    if (!verifyResult.isVerified) {
      const history = new MintHistory({
        referenceMetadataId,
        cryptoWallet,
        amount,
        description: 'Not verified',
        valid: verifyResult.isVerified,
        clientIp,
        clientAgent,
      });

      await this.persistableMintHistoryPort.create(history);

      throw new Error(history.description);
    }

    const mintTypeHash = this.signaturePort.hash(mintType);
    const payload: SignaturePayload = {
      types: ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
      values: [mintTypeHash, cryptoWallet, referenceMetadataId, 1, 1],
    };

    const chain = this.getPreSaleChain();

    const { signature, nonce } = await this.signaturePort.sign(
      payload,
      SignerType.BadgesMinter,
      chain,
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
        description: `${
          incremental ? '\t!' : '\x20'
        }incremental ${amount}x of #${referenceMetadataId} verified and signed`,
        valid: verifyResult.isVerified,
        clientIp,
        clientAgent,
      }),
    );

    return result;
  }

  getPreSaleChain(): Chain {
    let chainId = NetworkType.Ethereum;

    if (process.env.NODE_ENV === 'development') {
      chainId = NetworkType.EthereumGoerli;
    }

    return new Chain(chainId);
  }
}
