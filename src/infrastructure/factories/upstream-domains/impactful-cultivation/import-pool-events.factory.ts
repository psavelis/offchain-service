import { ImportPoolEventsUseCase } from '../../../../domain/upstream-domains/impactful-cultivation/usecases/import-pool-events.usecase';
import { SettingsAdapter } from '../../../adapters/config/settings.adapter';
import { Aes256EncryptionAdapter } from '../../../adapters/crypto/aes256/aes-256-encryption.adapter';
import Logger from '../../../adapters/logging/logger';
import { KnexPostgresDatabase } from '../../../repositories/offchain/knex-postgres.db';
import { FetchableAuditPoolStoredEventDbAdapter } from '../../../repositories/offchain/upstream-domains/impactful-cultivation/fetchable-audit-pool-stored-event.adapter';
import { PersistableAuditPoolStoredEventDbAdapter } from '../../../repositories/offchain/upstream-domains/impactful-cultivation/persistable-audit-pool-stored-event.adapter';
import { KannaProvider } from '../../../repositories/onchain/kanna.provider';
import { FetchableOnChainAuditPoolEventJsonRpcAdapter } from '../../../repositories/onchain/upstream-domains/impactful-cultivation/fetchable-onchain-auditpool-event.adapter';

const disabled = {
  execute: async () => Promise.resolve(),
};
export class ImportPoolEventsFactory {
  static instance: ImportPoolEventsUseCase;

  static getInstance(): ImportPoolEventsUseCase {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('import-pool');

    if (!loadAdapter) {
      return disabled as ImportPoolEventsUseCase;
    }

    if (!ImportPoolEventsFactory.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const encryptionPort = Aes256EncryptionAdapter.getInstance();
      const logger = Logger.getInstance();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const kannaProvider = KannaProvider.getInstance(settings);

      const fetchableAuditPoolStoredEventPort =
        FetchableAuditPoolStoredEventDbAdapter.getInstance(knexPostgresDb);

      const fetchableOnChainAuditPoolEventPort =
        FetchableOnChainAuditPoolEventJsonRpcAdapter.getInstance(
          kannaProvider,
          settings,
          encryptionPort,
        );

      const persistableAuditPoolEventPort =
        PersistableAuditPoolStoredEventDbAdapter.getInstance(knexPostgresDb);

      ImportPoolEventsFactory.instance = new ImportPoolEventsUseCase(
        logger,
        settings,
        encryptionPort,
        fetchableAuditPoolStoredEventPort,
        fetchableOnChainAuditPoolEventPort,
        persistableAuditPoolEventPort,
      );
    }

    return ImportPoolEventsFactory.instance;
  }
}
