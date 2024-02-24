import { type Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';
import { FetchableClearingDbAdapter } from '../../repositories/offchain/clearing/fetchable-clearing.adapter';
import { PersistableClearingDbAdapter } from '../../repositories/offchain/clearing/persistable-clearing.adapter';

import { type CreateClearingInteractor } from '../../../domain/clearing/interactors/create-clearing.interactor';
import { KnexPostgresDatabase } from '../../repositories/offchain/knex-postgres.db';

import { type Clearing } from '../../../domain/clearing/entities/clearing.entity';
import { type ProcessStatementTransactionInteractor } from '../../../domain/clearing/interactors/process-statement-transaction.interactor';
import { type FetchableStatementPort } from '../../../domain/clearing/ports/fetchable-statement.port';
import { CreateClearingUseCase } from '../../../domain/clearing/usecases/create-clearing.usecase';
import { ProcessStatementTransactionUseCase } from '../../../domain/clearing/usecases/process-statement-transaction.usecase';
import { type LoggablePort } from '../../../domain/common/ports/loggable.port';
import { type CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { type FetchOrderBatchInteractor } from '../../../domain/order/interactors/fetch-order-batch.interactor';
import { type RefreshOrderInteractor } from '../../../domain/order/interactors/refresh-order.interactor';
import { type FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { type PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { type PersistableOrderPort } from '../../../domain/order/ports/persistable-order.port';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { FetchOrderBatchUseCase } from '../../../domain/order/usecases/fetch-order-batch.usecase';
import { RefreshOrderUseCase } from '../../../domain/order/usecases/refresh-order.usecase';
import { type CreatePaymentInteractor } from '../../../domain/payment/interactors/create-payment-interactor';
import { type PersistablePaymentPort } from '../../../domain/payment/ports/persistable-payment.port';
import { CreatePaymentUseCase } from '../../../domain/payment/usecases/create-payment.usecase';
import { type CreateQuoteInteractor } from '../../../domain/price/interactors/create-quote.interactor';
import { FetchableStatementHttpAdapter } from '../../adapters/apis/statement/fetchable-statement.adapter';
import Logger from '../../adapters/logging/logger';
import { FetchableOrderDbAdapter } from '../../repositories/offchain/order/fetchable-order.adapter';
import { PersistableOrderStatusTransitionDbAdapter } from '../../repositories/offchain/order/persistable-order-status-transition.adapter';
import { PersistableOrderDbAdapter } from '../../repositories/offchain/order/persistable-order.adapter';
import { PersistablePaymentDbAdapter } from '../../repositories/offchain/payment/persistable-payment.adapter';
import { CreateQuoteFactory } from '../price/create-quote.factory';

const disabled = {
  execute: async () => Promise.resolve({} as Clearing),
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

      const persistableOrderPort: PersistableOrderPort =
        PersistableOrderDbAdapter.getInstance(knexPostgresDb);

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

      const createQuoteInteractor: CreateQuoteInteractor =
        CreateQuoteFactory.getInstance();

      const refreshOrderInteractor: RefreshOrderInteractor =
        new RefreshOrderUseCase(persistableOrderPort);

      const processTransactionInteractor: ProcessStatementTransactionInteractor =
        new ProcessStatementTransactionUseCase(
          settings,
          logger,
          createPaymentInteractor,
          createQuoteInteractor,
          refreshOrderInteractor,
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
