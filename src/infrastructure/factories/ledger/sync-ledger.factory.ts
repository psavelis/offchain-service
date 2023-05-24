import { Settings } from '../../../domain/common/settings';
import { SyncLedgerInteractor } from '../../../domain/ledger/interactors/sync-ledger.interactor';
import { SyncLedgerUseCase } from '../../../domain/ledger/usecases/sync-ledger.usecase';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { FixedPointCalculusAdapter } from '../../adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { Aes256EncryptionAdapter } from '../../adapters/outbound/encryption/aes256/aes-256-encryption.adapter';
import { FetchableJournalEntryDbAdapter } from '../../adapters/outbound/database/ledger/fetchable-journal-entry.adapter';
import { FetchableJournalTransferEventRpcAdapter } from '../../adapters/outbound/json-rpc/ledger/fetchable-journal-transfer-event.adapter';
import { FetchableBalanceDbAdapter } from '../../adapters/outbound/database/ledger/fetchable-balance.adapter';
import { PersistableBalanceJournalDbAdapter } from '../../adapters/outbound/database/ledger/persistable-balance-journal.adapter';
import Logger from '../../adapters/outbound/log/logger';
import { LoggablePort } from '../../../domain/common/ports/loggable.port';

const disabled = {
  execute: () => Promise.resolve(),
};

export class SyncLedgerFactory {
  static instance: SyncLedgerInteractor;

  static getInstance(): SyncLedgerInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('ledger-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const kannaProvider = KannaProvider.getInstance(settings);

      const calculusAdapter = FixedPointCalculusAdapter.getInstance();
      const encryptionAdapter: EncryptionPort =
        Aes256EncryptionAdapter.getInstance();

      const fetchableJournalEntryAdapter =
        FetchableJournalEntryDbAdapter.getInstance(settings, knexPostgresDb);

      const fetchableJournalTransferEventAdapter =
        new FetchableJournalTransferEventRpcAdapter(settings, kannaProvider);

      const fetchableBalanceAdapter =
        FetchableBalanceDbAdapter.getInstance(knexPostgresDb);

      const persistableBalanceJournalAdapter =
        PersistableBalanceJournalDbAdapter.getInstance(knexPostgresDb);

      this.instance = new SyncLedgerUseCase(
        settings,
        logger,
        calculusAdapter,
        encryptionAdapter,
        fetchableJournalEntryAdapter,
        fetchableJournalTransferEventAdapter,
        fetchableBalanceAdapter,
        persistableBalanceJournalAdapter,
      );
    }

    return this.instance;
  }
}
