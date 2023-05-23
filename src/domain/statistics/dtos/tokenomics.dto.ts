import { NetworkType } from '../../common/enums/network-type.enum';

export interface TokenomicsDto {
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  lockedTokens: number;
  marketCap: number;
  treasuryMarketValue: number;
  price: {
    usd: number;
    brl: number;
    matic: number;
    eth: number;
  };
  contracts: Record<
    NetworkType,
    {
      token: string;
      treasury: string;
      sale: string;
      presale?: string;
      yieldPool?: string;
      carbonPool?: string;
      stockOptionPool?: string;
    }
  >;
}
