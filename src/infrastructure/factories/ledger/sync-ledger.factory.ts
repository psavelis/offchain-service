import {type Settings} from '../../../domain/common/settings';
import {type SyncLedgerInteractor} from '../../../domain/ledger/interactors/sync-ledger.interactor';
import {SyncLedgerUseCase} from '../../../domain/ledger/usecases/sync-ledger.usecase';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {KannaProvider} from '../../repositories/onchain/kanna.provider';
import {FixedPointCalculusAdapter} from '../../adapters/unsupported-types/uint256/calculus/fixed-point-calculus.adapter';
import {type EncryptionPort} from '../../../domain/common/ports/encryption.port';
import {Aes256EncryptionAdapter} from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import {FetchableJournalEntryDbAdapter} from '../../repositories/offchain/ledger/fetchable-journal-entry.adapter';
import {FetchableJournalTransferEventRpcAdapter} from '../../repositories/onchain/ledger/fetchable-journal-transfer-event.adapter';
import {FetchableBalanceDbAdapter} from '../../repositories/offchain/ledger/fetchable-balance.adapter';
import {PersistableBalanceJournalDbAdapter} from '../../repositories/offchain/ledger/persistable-balance-journal.adapter';
import Logger from '../../adapters/logging/logger';
import {type LoggablePort} from '../../../domain/common/ports/loggable.port';

const disabled = {
  execute: async () => Promise.resolve(),
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
