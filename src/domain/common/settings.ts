import { type Chain } from './entities/chain.entity';

export type Settings = {
  cbc: {
    key: string;
  };
  sha3: {
    identitySecret: string;
  };
  ecdsaP521: {
    key: string;
    pubKey: string;
    expiresIn: string;
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
      legacyPreSaleClaimSignerKey: string;
      fixedSaleClaimsSignerKey: string;
      dynamicSaleClaimsSignerKey: string;
      dynamicSaleClaimsManagerKey: string;
      badgesMinterSignerKey: string;
      contracts: {
        gnosisSafeAddress: string;
        tokenAddress: string;
        saleAddress: string;
        legacyPreSaleAddress: string;
        badgeAddress: string;
        dynamicSaleAddress: string;
        auditPoolAddress: string;
      };
      network: string;
      providerApiKey: string;
    };
    polygon: {
      badgesMinterSignerKey: string;
      providerEndpoint: string;
      claimManagerKey: string;
      claimSignerKey: string;
      dynamicSaleClaimsSignerKey: string;
      dynamicSaleClaimsManagerKey: string;
      contracts: {
        badgeAddress: string;
        gnosisSafeAddress: string;
        fxTokenAddress: string;
        saleAddress: string;
        dynamicSaleAddress: string;
        auditPoolAddress: string;
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
  expiration: {
    integromatAddress: string;
  };
  badge: {
    presale: {
      referenceMetadataId: number;
    };
    impactfulCultivation: {
      auditPoolEarlyValidator: {
        referenceMetadataId: number;
      };
      auditPool: {
        referenceMetadataId: number;
      };
    };
  };
  cex: {
    mb: {
      host: string;
      login: string;
      password: string;
      fallback: {
        knnBrlFallbackUint256: string;
      };
      endpoints: {
        authorize: string;
        ticker: string;
        tradingOrders: string;
        accounts: string;
        balances: string;
        statement: string;
      };
    };
  };
};
