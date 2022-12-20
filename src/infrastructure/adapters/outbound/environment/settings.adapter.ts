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
        cep: this.envString('PIX_CEP'),
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
    };
  }
}
