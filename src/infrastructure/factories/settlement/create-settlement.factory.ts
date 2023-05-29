import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import { Settings } from '../../../domain/common/settings';
import { FetchOrderBatchInteractor } from '../../../domain/order/interactors/fetch-order-batch.interactor';
import { CreateSettlementInteractor } from '../../../domain/settlement/interactors/create-settlement.interactor';
import { ProcessOrderSettlementInteractor } from '../../../domain/settlement/interactors/process-order-settlement.interactor';
import { CreateSettlementUseCase } from '../../../domain/settlement/usecases/create-settlement.usecase';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';
import { PersistableOrderStatusTransitionDbAdapter } from '../../adapters/outbound/database/order/persistable-order-status-transition.adapter';
import Logger from '../../adapters/outbound/log/logger';
import { FetchOrderBatchUseCase } from '../../../domain/order/usecases/fetch-order-batch.usecase';
import { FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { ProcessOrderSettlementUseCase } from '../../../domain/settlement/usecases/process-order-settlement.usecase';
import { DispatchSupplyInteractor } from '../../../domain/supply/interactors/dispatch-supply.interactor';
import { DispatchSupplyUseCase } from '../../../domain/supply/usecases/dispatch-supply.usecase';
import { ClaimSupplyPort } from '../../../domain/supply/ports/claim-supply.port';
import { ClaimSupplyRpcAdapter } from '../../adapters/outbound/json-rpc/supply/claim-supply.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { LockSupplyRpcAdapter } from '../../adapters/outbound/json-rpc/supply/lock-supply.adapter';
import { LockSupplyPort } from '../../../domain/supply/ports/lock-supply.port';
import { PersistableClaimPort } from '../../../domain/supply/ports/persistable-claim.port';
import { PersistableClaimDbAdapter } from '../../adapters/outbound/database/supply/persistable-claim.adapter';
import { PersistableReceiptPort } from '../../../domain/supply/ports/persistable-receipt.port';
import { PersistableReceiptDbAdapter } from '../../adapters/outbound/database/supply/persistable-receipt.adapter';
import { PersistableLockPort } from '../../../domain/supply/ports/persistable-lock.port';
import { PersistableLockDbAdapter } from '../../adapters/outbound/database/supply/persistable-lock.adapter';
import { MailerPort } from '../../../domain/common/ports/mailer.port';
import Mailer from '../../adapters/outbound/smtp/mailer.adapter';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { Aes256EncryptionAdapter } from '../../adapters/outbound/encryption/aes256/aes-256-encryption.adapter';

const disabled = {
  execute: () => Promise.resolve(),
};
export class CreateSettlementFactory {
  static instance: CreateSettlementInteractor;

  static getInstance(): CreateSettlementInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('settlement-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const kannaProvider = KannaProvider.getInstance(settings);
      const mailer: MailerPort = Mailer.getInstance(settings);

      const claimSupplyPort: ClaimSupplyPort =
        ClaimSupplyRpcAdapter.getInstance(settings, kannaProvider);

      const lockSupplyPort: LockSupplyPort = LockSupplyRpcAdapter.getInstance(
        settings,
        kannaProvider,
      );

      const persistableClaimPort: PersistableClaimPort =
        PersistableClaimDbAdapter.getInstance(knexPostgresDb);

      const persistableReceiptPort: PersistableReceiptPort =
        PersistableReceiptDbAdapter.getInstance(knexPostgresDb);

      const persistableLockPort: PersistableLockPort =
        PersistableLockDbAdapter.getInstance(knexPostgresDb);

      const persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort =
        PersistableOrderStatusTransitionDbAdapter.getInstance(knexPostgresDb);

      const createOrderTransitionInteractor: CreateOrderTransitionInteractor =
        new CreateOrderStatusTransitionUseCase(
          persistableOrderStatusTransitionPort,
        );
      const encryptionPort: EncryptionPort =
        Aes256EncryptionAdapter.getInstance();

      const dispatchSupplyInteractor: DispatchSupplyInteractor =
        new DispatchSupplyUseCase(
          logger,
          settings,
          claimSupplyPort,
          lockSupplyPort,
          encryptionPort,
          persistableClaimPort,
          persistableReceiptPort,
          persistableLockPort,
        );

      const processOrderSettlementInteractor: ProcessOrderSettlementInteractor =
        new ProcessOrderSettlementUseCase(
          settings,
          logger,
          encryptionPort,
          dispatchSupplyInteractor,
          createOrderTransitionInteractor,
          mailer,
        );

      const fetchableOrderPort: FetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const fetchOrderBatchInteractor: FetchOrderBatchInteractor =
        new FetchOrderBatchUseCase(fetchableOrderPort);

      this.instance = new CreateSettlementUseCase(
        logger,
        processOrderSettlementInteractor,
        fetchOrderBatchInteractor,
      );
    }

    return this.instance;
  }
}
