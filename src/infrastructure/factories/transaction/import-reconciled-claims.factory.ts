import {type LoggablePort} from '../../../domain/common/ports/loggable.port';
import {type Settings} from '../../../domain/common/settings';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import Logger from '../../adapters/logging/logger';
import {KannaProvider} from '../../repositories/onchain/kanna.provider';
import {FetchableOrderDbAdapter} from '../../repositories/offchain/order/fetchable-order.adapter';
import {CreateOrderStatusTransitionUseCase} from '../../../domain/order/usecases/create-order-status-transition.usecase';
import {PersistableOrderStatusTransitionDbAdapter} from '../../repositories/offchain/order/persistable-order-status-transition.adapter';

import {type ImportReconciledClaimsInteractor} from '../../../domain/transaction/interactors/import-reconciled-claims.interactor';
import {ImportReconciledClaimsUseCase} from '../../../domain/transaction/usecases/import-reconciled-claims.usecase';
import {ReconcileDelegateSignatureClaimUseCase} from '../../../domain/supply/usecases/reconcile-delegate-signature-claim.usecase';
import {type FetchableDelegateClaimEventPort} from '../../../domain/supply/ports/fetchable-delegate-claim-event.port';
import {FetchableDelegateClaimEventRpcAdapter} from '../../repositories/onchain/supply/fetchable-delegate-claim-event.adapter';
import {type FetchableOrderPort} from '../../../domain/order/ports/fetchable-order.port';

import {PersistableClaimReceiptDbAdapter} from '../../repositories/offchain/transaction/persistable-claim-receipt.adapter';

const disabled = {
  execute: async () => Promise.resolve(),
};

export class ImportReconciledClaimsFactory {
  static instance: ImportReconciledClaimsInteractor;

  static getInstance(): ImportReconciledClaimsInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('reconcile-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const kannaProvider = KannaProvider.getInstance(settings);

      const fetchableDelegateClaimEventPort: FetchableDelegateClaimEventPort =
        new FetchableDelegateClaimEventRpcAdapter(settings, kannaProvider);

      const fetchableOrderPort: FetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const reconcileUseCase = new ReconcileDelegateSignatureClaimUseCase(
        logger,
        fetchableDelegateClaimEventPort,
        fetchableOrderPort,
      );

      const persistableOrderStatusTransitionPort =
        PersistableOrderStatusTransitionDbAdapter.getInstance(knexPostgresDb);

      const createOrderTransition = new CreateOrderStatusTransitionUseCase(
        persistableOrderStatusTransitionPort,
      );

      const persistableClaimReceiptPort =
        PersistableClaimReceiptDbAdapter.getInstance(knexPostgresDb);

      this.instance = new ImportReconciledClaimsUseCase(
        logger,
        reconcileUseCase,
        createOrderTransition,
        persistableClaimReceiptPort,
      );
    }

    return this.instance;
  }
}
