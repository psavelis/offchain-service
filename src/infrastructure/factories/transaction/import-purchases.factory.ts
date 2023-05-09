import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import { Settings } from '../../../domain/common/settings';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import Logger from '../../adapters/outbound/log/logger';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { ImportPurchasesInteractor } from '../../../domain/transaction/interactors/import-purchases.interactor';
import { ImportPurchasesUseCase } from '../../../domain/transaction/usecases/import-purchases.usecase';
import { FetchablePurchasePort } from '../../../domain/transaction/ports/fetchable-purchase.port';
import { FetchablePurchaseDbAdapter } from '../../adapters/outbound/database/transaction/fetchable-purchase.adapter';

import { FetchableOnChainPurchaseEventRpcAdapter } from '../../adapters/outbound/json-rpc/transaction/fetchable-onchain-purchase-event.adapter';
import { PersistablePurchaseDbAdapter } from '../../adapters/outbound/database/transaction/persistable-purchase.adapter';
import { FetchableOnChainPurchaseEventPort } from '../../../domain/transaction/ports/fetchable-onchain-purchase-event.port';

const disabled = {
  execute: () => Promise.resolve(),
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
