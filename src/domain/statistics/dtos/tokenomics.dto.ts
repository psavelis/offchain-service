export interface TokenomicsDto {
  mintDate: Date;
  totalSupply: number;
  maxSupply: number;
  circulatingSupply: number;
  holders: {
    totalTransfers: number;
    count: number;
    totalAmount: number;
  };
  lockedTokens: {
    totalAmount: number;
    preSale: number;
    sale: number;
  };
  totalValueLocked: {
    BRL: number;
    USD: number;
    ETH: number;
    MATIC: number;
  };
  fullyDilutedMarketCap: {
    BRL: number;
    USD: number;
    ETH: number;
    MATIC: number;
  };
  circulatingSupplyMarketCap: {
    BRL: number;
    USD: number;
    ETH: number;
    MATIC: number;
  };
  marketCap: {
    USD: number;
    BRL: number;
    MATIC: number;
    ETH: number;
  };
  price: {
    BRL: number;
    USD: number;
    ETH: number;
    MATIC: number;
  };
  networks: Array<string>;
  contracts: Record<
    string,
    {
      token: string;
      treasury: string;
      sale: string;
      presale?: string | undefined;
      yieldPool?: string | undefined;
      carbonPool?: string | undefined;
      stockOptionPool?: string | undefined;
    }
  >;
}
