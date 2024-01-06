import { SignMintInteractor } from '../interactors/sign-mint.interactor';
import { FetchBadgeSignatureInteractor } from '../interactors/fetch-badge-signature.interactor';
import { SignedMintResponseDto } from '../dtos/signed-mint-response.dto';
import { NetworkType } from '../../common/enums/network-type.enum';
import { Chain } from '../../common/entities/chain.entity';
import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';

export class FetchAggregatedSignatureUseCase
  implements FetchBadgeSignatureInteractor
{
  constructor(
    readonly signAggregatedMintInteractor: SignMintInteractor,
    readonly verifyAggregatedMintInteractor: VerifyMintInteractor,
  ) {}

  async execute(
    cryptoWallet: string,
    referenceMetadataId: number,
    clientIp: string,
    clientAgent: string,
    chainId?: number,
  ): Promise<SignedMintResponseDto | undefined> {
    const isProd = process.env.NODE_ENV === 'production';
    const chain = new Chain(
      chainId ?? (isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia),
    );

    const verifyResult = await this.verifyAggregatedMintInteractor.execute({
      cryptoWallet,
      referenceMetadataId,
      chain,
    });

    if (!verifyResult?.dueDate) {
      return;
    }

    return this.signAggregatedMintInteractor.execute({
      cryptoWallet,
      chainId: verifyResult.chainId,
      referenceMetadataId: verifyResult.referenceMetadataId,
      clientIp,
      clientAgent,
    });
  }
}
