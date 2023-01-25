import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { PersistableClearingDbAdapter } from '../../adapters/outbound/database/clearing/persistable-clearing.adapter';
import { FetchableClearingDbAdapter } from '../../adapters/outbound/database/clearing/fetchable-clearing.adapter';

import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { CreateClearingInteractor } from '../../../domain/clearing/interactors/create-clearing.interactor';

import { CreateClearingUseCase } from '../../../domain/clearing/usecases/create-clearing.usecase';
import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import Logger from '../../adapters/outbound/log/logger';
import { FetchableStatementPort } from '../../../domain/clearing/ports/fetchable-statement.port';
import { FetchableStatementHttpAdapter } from '../../adapters/outbound/http/statement/fetchable-statement.adapter';
import { FetchOrderBatchInteractor } from '../../../domain/order/interactors/fetch-order-batch.interactor';
import { FetchOrderBatchUseCase } from '../../../domain/order/usecases/fetch-order-batch.usecase';
import { FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';
import { ProcessStatementTransactionInteractor } from '../../../domain/clearing/interactors/process-statement-transaction.interactor';
import { ProcessStatementTransactionUseCase } from '../../../domain/clearing/usecases/process-statement-transaction.usecase';
import { CreatePaymentInteractor } from '../../../domain/payment/interactors/create-payment-interactor';
import { CreatePaymentUseCase } from '../../../domain/payment/usecases/create-payment.usecase';
import { PersistablePaymentPort } from '../../../domain/payment/ports/persistable-payment.port';
import { PersistablePaymentDbAdapter } from '../../adapters/outbound/database/payment/persistable-payment.adapter';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { PersistableOrderStatusTransitionDbAdapter } from '../../adapters/outbound/database/order/persistable-order-status-transition.adapter';
import { PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { Clearing } from 'src/domain/clearing/entities/clearing.entity';

const disabled = {
  execute: () => Promise.resolve({} as Clearing),
};

export class CreateClearingFactory {
  static instance: CreateClearingInteractor;

  static getInstance(): CreateClearingInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('clearing-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableClearingPort =
        PersistableClearingDbAdapter.getInstance(knexPostgresDb);

      const fetchableClearingPort =
        FetchableClearingDbAdapter.getInstance(knexPostgresDb);

      const fetchableStatementPort: FetchableStatementPort =
        FetchableStatementHttpAdapter.getInstance(settings, logger);

      const fetchableOrderPort: FetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const fetchOrderBatchInteractor: FetchOrderBatchInteractor =
        new FetchOrderBatchUseCase(fetchableOrderPort);

      const persistablePaymentPort: PersistablePaymentPort =
        PersistablePaymentDbAdapter.getInstance(knexPostgresDb);

      const createPaymentInteractor: CreatePaymentInteractor =
        new CreatePaymentUseCase(persistablePaymentPort);

      const persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort =
        PersistableOrderStatusTransitionDbAdapter.getInstance(knexPostgresDb);

      const createOrderStatusTransition: CreateOrderTransitionInteractor =
        new CreateOrderStatusTransitionUseCase(
          persistableOrderStatusTransitionPort,
        );

      const processTransactionInteractor: ProcessStatementTransactionInteractor =
        new ProcessStatementTransactionUseCase(
          logger,
          createPaymentInteractor,
          createOrderStatusTransition,
        );

      this.instance = new CreateClearingUseCase(
        logger,
        fetchableClearingPort,
        fetchableStatementPort,
        persistableClearingPort,
        fetchOrderBatchInteractor,
        processTransactionInteractor,
      );
    }

    return this.instance;
  }
}
