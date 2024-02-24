import { type NetworkType } from 'src/domain/common/enums/network-type.enum';

export type SignMintRequestDto = {
  cryptoWallet: string;
  referenceMetadataId: number;
  chainId: NetworkType;
  clientIp: string;
  clientAgent: string;
};
