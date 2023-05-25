import { config } from 'dotenv';
import { Settings } from '../../../../domain/common/settings';
import { NetworkType } from '../../../../domain/common/enums/network-type.enum';
import { Chain } from '../../../../domain/common/entities/chain.entity';

export class SettingsAdapter {
  static instance: SettingsAdapter;

  private constructor() {
    config();
  }

  static getInstance() {
    if (!SettingsAdapter.instance) {
      SettingsAdapter.instance = new SettingsAdapter();
    }

    return SettingsAdapter.instance;
  }

  envString(key: string): string {
    const value = process.env[key] as string;

    if (!value) {
      new Error(`Missing Environment '${key}' (expected: a string value)`);
    }

    return value;
  }

  envNumber(key: string): number {
    const value = process.env[key] as string;

    if (!value) {
      new Error(`Missing Environment '${key}' (expected: a number value)`);
    }

    return parseInt(value, 10);
  }

  getSettings(): Settings {
    return {
      pix: {
        key: this.envString('PIX_KEY'),
        name: this.envString('PIX_NAME'),
        city: this.envString('PIX_CITY'),
        productDescription: 'Token KNN',
      },
      db: {
        database: this.envString('POSTGRES_DB'),
        host: this.envString('POSTGRES_HOST'),
        password: this.envString('POSTGRES_PASSWORD'),
        port: this.envNumber('POSTGRES_PORT'),
        schemaName: this.envString('POSTGRES_SCHEMA'),
        user: this.envString('POSTGRES_USER'),
      },
      sha3: {
        identitySecret: this.envString('IDENTITY_SECRET'),
      },
      blockchain: {
        // TODO: toggle for l2 bridge
        // current: new Chain(
        //   process.env.NODE_ENV === 'production'
        //     ? NetworkType.Polygon
        //     : NetworkType.PolygonMumbai,
        // ),

        current: new Chain(
          process.env.NODE_ENV === 'production'
            ? NetworkType.Ethereum
            : NetworkType.EthereumGoerli,
        ),
        ethereum: {
          providerEndpoint: this.envString('RPC_PROVIDER_ENDPOINT'),
          claimManagerKey: this.envString('CLAIM_MANAGER_KEY'),
          legacyClaimSignerKey: this.envString('CLAIM_SIGNER_KEY'),
          currentClaimSignerKey: this.envString('SALE_CLAIM_SIGNER_KEY'),
          badgesMinterSignerKey: this.envString('BADGES_MINTER_SIGNER_KEY'),
          providerApiKey: this.envString('RPC_PROVIDER_API_KEY'),
          network: this.envString('RPC_NETWORK'),
          contracts: {
            tokenAddress: this.envString('ERC20_CONTRACT_ADDRESS'),
            legacyPreSaleAddress: this.envString('PRESALE_CONTRACT_ADDRESS'),
            saleAddress: this.envString('SALE_CONTRACT_ADDRESS'),
            badgeAddress: this.envString('BADGE_CONTRACT_ADDRESS'),
            gnosisSafeAddress: this.envString('GNOSIS_SAFE_ADDRESS'),
          },
        },
        polygon: {
          providerEndpoint: this.envString('POLYGON_RPC_PROVIDER_ENDPOINT'),
          claimManagerKey: this.envString('POLYGON_CLAIM_MANAGER_KEY'),
          claimSignerKey: this.envString('POLYGON_SALE_CLAIM_SIGNER_KEY'),
          providerApiKey: this.envString('POLYGON_RPC_PROVIDER_API_KEY'),
          network: this.envString('POLYGON_RPC_NETWORK'),
          contracts: {
            fxTokenAddress: this.envString('POLYGON_ERC20_CONTRACT_ADDRESS'),
            saleAddress: this.envString('POLYGON_SALE_CONTRACT_ADDRESS'),
            gnosisSafeAddress: this.envString('POLYGON_GNOSIS_SAFE_ADDRESS'),
          },
        },
      },
      price: {
        quoteExpirationSeconds: this.envNumber('QUOTE_EXPIRATION_SECONDS'),
        persistQuotes: JSON.parse(this.envString('PERSIST_QUOTES')),
      },
      statementProvider: {
        clientKey: this.envString('STATEMENT_PROVIDER_CLIENT_KEY'),
        clientCert: this.envString('STATEMENT_PROVIDER_CLIENT_CERT'),
        path: this.envString('STATEMENT_PROVIDER_PATH'),
        hostname: this.envString('STATEMENT_PROVIDER_HOSTNAME'),
      },
      oauthProvider: {
        path: this.envString('STATEMENT_PROVIDER_OAUTH_PATH'),
        clientId: this.envString('STATEMENT_PROVIDER_CLIENT_ID'),
        clientSecret: this.envString('STATEMENT_PROVIDER_CLIENT_SECRET'),
        scope: this.envString('STATEMENT_PROVIDER_SCOPE'),
        grantType: this.envString('STATEMENT_PROVIDER_GRANT_TYPE'),
      },
      smtp: {
        sender: this.envString('SMTP_SENDER'),
        replyTo: this.envString('SMTP_REPLYTO'),
        host: this.envString('SMTP_HOST'),
        port: this.envString('SMTP_PORT'),
        username: this.envString('SMTP_USERNAME'),
        password: this.envString('SMTP_PASSWORD'),
      },
      cbc: {
        key: this.envString('CBC_KEY'),
      },
      badge: {
        presale: {
          referenceMetadataId: 2,
        },
      },
    };
  }
}
