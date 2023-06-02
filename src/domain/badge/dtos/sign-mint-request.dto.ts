import { Chain } from 'src/domain/common/entities/chain.entity';
import { NetworkType } from 'src/domain/common/enums/network-type.enum';

export interface SignMintRequestDto {
  cryptoWallet: string;
  referenceMetadataId: number;
  chainId: NetworkType;
  clientIp: string;
  clientAgent: string;
}
