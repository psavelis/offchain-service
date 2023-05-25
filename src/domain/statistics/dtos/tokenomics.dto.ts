import { Chain } from '../../common/entities/chain.entity';
import { NetworkType } from '../../common/enums/network-type.enum';

export interface TokenomicsDto {
  totalSupply: number;
  circulatingSupply: number;
  holders: {
    count: number;
    totalAmount: number;
  };
  lockedTokens: {
    totalAmount: number;
    preSale: number;
    sale: number;
  };
  // TVL (total locked value)
  totalLockedValue: {
    usd: number;
    brl: number;
    matic: number;
    eth: number;
  };
  // marketCap := circulatingSupply * price
  marketCap: {
    usd: number;
    brl: number;
    matic: number;
    eth: number;
  };
  // TVM (treasury market value) => to be defined
  treasuryMarketValue: {
    usd: number;
    brl: number;
    matic: number;
    eth: number;
  };
  price: {
    usd: number;
    brl: number;
    matic: number;
    eth: number;
  };
  networks: Array<Chain>;
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
