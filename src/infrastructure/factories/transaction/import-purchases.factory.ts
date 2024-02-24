import {type LoggablePort} from '../../../domain/common/ports/loggable.port';
import {type Settings} from '../../../domain/common/settings';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import Logger from '../../adapters/logging/logger';
import {KannaProvider} from '../../repositories/onchain/kanna.provider';
import {type ImportPurchasesInteractor} from '../../../domain/transaction/interactors/import-purchases.interactor';
import {ImportPurchasesUseCase} from '../../../domain/transaction/usecases/import-purchases.usecase';
import {type FetchablePurchasePort} from '../../../domain/transaction/ports/fetchable-purchase.port';
import {FetchablePurchaseDbAdapter} from '../../repositories/offchain/transaction/fetchable-purchase.adapter';

import {FetchableOnChainPurchaseEventRpcAdapter} from '../../repositories/onchain/transaction/fetchable-onchain-purchase-event.adapter';
import {PersistablePurchaseDbAdapter} from '../../repositories/offchain/transaction/persistable-purchase.adapter';
import {type FetchableOnChainPurchaseEventPort} from '../../../domain/transaction/ports/fetchable-onchain-purchase-event.port';

const disabled = {
  execute: async () => Promise.resolve(),
};

export class ImportPurchasesFactory {
  static instance: ImportPurchasesInteractor;

  static getInstance(): ImportPurchasesInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('purchases-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const kannaProvider = KannaProvider.getInstance(settings);

      const fetchablePurchasePort: FetchablePurchasePort =
        FetchablePurchaseDbAdapter.getInstance(knexPostgresDb);

      const fetchableOnChainPurchaseEventPort: FetchableOnChainPurchaseEventPort =
        new FetchableOnChainPurchaseEventRpcAdapter(settings, kannaProvider);

      const persistablePurchasePort =
        PersistablePurchaseDbAdapter.getInstance(knexPostgresDb);

      this.instance = new ImportPurchasesUseCase(
        logger,
        fetchablePurchasePort,
        fetchableOnChainPurchaseEventPort,
        persistablePurchasePort,
      );
    }

    return this.instance;
  }
}
