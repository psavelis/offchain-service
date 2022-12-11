export interface Settings {
  price: {
    quoteExpirationSeconds: number;
    persistQuotes: boolean;
  };
  db: {
    database: string;
    host: string;
    password: string;
    port: number;
    schemaName: string;
    user: string;
  };
  blockchain: {
    providerEndpoint: string;
    claimManagerKey: string;
    contracts: {
      preSaleAddress: string;
    };
    network: string;
    providerApiKey: string;
  };
}
