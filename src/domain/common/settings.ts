export interface Settings {
  oauthProvider: {
    path: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    grantType: string;
  };
  statementProvider: {
    clientKey: string;
    clientCert: string;
    path: string;
    hostname: string;
  };
  pix: {
    key: string;
    name: string;
    city: string;
    productDescription: string;
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
  smtp: {
    sender: string;
    replyTo: string;
    host: string;
    port: string;
    username: string;
    password: string;
  };
}
