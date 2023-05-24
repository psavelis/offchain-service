import { Chain } from './entities/chain.entity';

export interface Settings {
  cbc: {
    key: string;
  };
  sha3: {
    identitySecret: string;
  };
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
    current: Chain;
    ethereum: {
      providerEndpoint: string;
      claimManagerKey: string;
      legacyClaimSignerKey: string;
      currentClaimSignerKey: string;
      badgesMinterSignerKey: string;
      contracts: {
        tokenAddress: string;
        saleAddress: string;
        legacyPreSaleAddress: string;
        badgeAddress: string;
      };
      network: string;
      providerApiKey: string;
    };
    polygon: {
      providerEndpoint: string;
      claimManagerKey: string;
      claimSignerKey: string;
      contracts: {
        fxTokenAddress: string;
        saleAddress: string;
      };
      network: string;
      providerApiKey: string;
    };
  };
  smtp: {
    sender: string;
    replyTo: string;
    host: string;
    port: string;
    username: string;
    password: string;
  };
  badge: {
    presale: {
      referenceMetadataId: number;
    };
  };
}
