import { config } from 'dotenv';
import { Settings } from '../../../../domain/common/settings';

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
      blockchain: {
        providerEndpoint: this.envString('RPC_PROVIDER_ENDPOINT'),
        claimManagerKey: this.envString('CLAIM_MANAGER_KEY'),
        providerApiKey: this.envString('RPC_PROVIDER_API_KEY'),
        network: this.envString('RPC_NETWORK'),
        contracts: {
          preSaleAddress: this.envString('PRESALE_CONTRACT_ADDRESS'),
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
        host: this.envString('SMTP_HOST'),
        port: this.envString('SMTP_PORT'),
        username: this.envString('SMTP_USERNAME'),
        password: this.envString('SMTP_PASSWORD'),
      }
    };
  }
}
