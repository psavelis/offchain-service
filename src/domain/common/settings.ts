export interface Settings {
  pix: {
    key: string;
    name: string;
    city: string;
    cep: string;
  };
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
