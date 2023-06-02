import { Chain } from 'src/domain/common/entities/chain.entity';

export interface SignMintRequestDto {
  cryptoWallet: string;
  referenceMetadataId: number;
  chain: Chain;
  clientIp: string;
  clientAgent: string;
}
