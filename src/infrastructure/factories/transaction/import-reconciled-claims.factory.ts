import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import { Settings } from '../../../domain/common/settings';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import Logger from '../../adapters/outbound/log/logger';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { PersistableOrderStatusTransitionDbAdapter } from '../../adapters/outbound/database/order/persistable-order-status-transition.adapter';

import { ImportReconciledClaimsInteractor } from '../../../domain/transaction/interactors/import-reconciled-claims.interactor';
import { ImportReconciledClaimsUseCase } from '../../../domain/transaction/usecases/import-reconciled-claims.usecase';
import { ReconcileDelegateSignatureClaimUseCase } from '../../../domain/supply/usecases/reconcile-delegate-signature-claim.usecase';
import { FetchableDelegateClaimEventPort } from '../../../domain/supply/ports/fetchable-delegate-claim-event.port';
import { FetchableDelegateClaimEventRpcAdapter } from '../../adapters/outbound/json-rpc/supply/fetchable-delegate-claim-event.adapter';
import { FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';

const disabled = {
  execute: () => Promise.resolve(),
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

      this.instance = new ImportReconciledClaimsUseCase(
        logger,
        reconcileUseCase,
        createOrderTransition,
      );
    }

    return this.instance;
  }
}
