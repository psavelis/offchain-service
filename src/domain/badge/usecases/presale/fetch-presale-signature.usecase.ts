import { Chain } from '../../../common/entities/chain.entity';
import { NetworkType } from '../../../common/enums/network-type.enum';
import { SignedMintResponseDto } from '../../dtos/signed-mint-response.dto';
import { FetchBadgeSignatureInteractor } from '../../interactors/fetch-badge-signature.interactor';
import { SignMintInteractor } from '../../interactors/sign-mint.interactor';
import { VerifyMintInteractor } from '../../interactors/verify-mint-request.interactor';

export class FetchPreSaleSignatureUseCase
implements FetchBadgeSignatureInteractor
{
  constructor(
    readonly signPreSaleMintInteractor: SignMintInteractor,
    readonly verifyMintInteractor: VerifyMintInteractor,
  ) {}

  async execute(
    cryptoWallet: string,
    clientIp: string,
    clientAgent: string,
  ): Promise<SignedMintResponseDto | undefined> {
    const isProd = process.env.NODE_ENV === 'production';
    const chain = new Chain(
      isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia,
    );

    const verifyResult = await this.verifyMintInteractor.execute({
      cryptoWallet,
      chain,
    });

    if (!verifyResult?.dueDate) {
      return;
    }

    return this.signPreSaleMintInteractor.execute({
      cryptoWallet,
      chainId: verifyResult.chainId,
      referenceMetadataId: verifyResult.referenceMetadataId,
      clientIp,
      clientAgent,
    });
  }
}
