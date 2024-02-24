import { type EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { type LoggablePort } from '../../../domain/common/ports/loggable.port';
import { type MailerPort } from '../../../domain/common/ports/mailer.port';
import { type Settings } from '../../../domain/common/settings';
import { type CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { type FetchOrderBatchInteractor } from '../../../domain/order/interactors/fetch-order-batch.interactor';
import { type FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { type PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { FetchOrderBatchUseCase } from '../../../domain/order/usecases/fetch-order-batch.usecase';
import { type CreateSettlementInteractor } from '../../../domain/settlement/interactors/create-settlement.interactor';
import { type ProcessOrderSettlementInteractor } from '../../../domain/settlement/interactors/process-order-settlement.interactor';
import { CreateSettlementUseCase } from '../../../domain/settlement/usecases/create-settlement.usecase';
import { ProcessOrderSettlementUseCase } from '../../../domain/settlement/usecases/process-order-settlement.usecase';
import { type DispatchSupplyInteractor } from '../../../domain/supply/interactors/dispatch-supply.interactor';
import { type ClaimSupplyPort } from '../../../domain/supply/ports/claim-supply.port';
import { type LockSupplyPort } from '../../../domain/supply/ports/lock-supply.port';
import { type PersistableClaimPort } from '../../../domain/supply/ports/persistable-claim.port';
import { type PersistableLockPort } from '../../../domain/supply/ports/persistable-lock.port';
import { type PersistableReceiptPort } from '../../../domain/supply/ports/persistable-receipt.port';
import { DispatchSupplyUseCase } from '../../../domain/supply/usecases/dispatch-supply.usecase';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';
import { Aes256EncryptionAdapter } from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import Logger from '../../adapters/logging/logger';
import Mailer from '../../adapters/mailing/mailer.adapter';
import { KnexPostgresDatabase } from '../../repositories/offchain/knex-postgres.db';
import { FetchableOrderDbAdapter } from '../../repositories/offchain/order/fetchable-order.adapter';
import { PersistableOrderStatusTransitionDbAdapter } from '../../repositories/offchain/order/persistable-order-status-transition.adapter';
import { PersistableClaimDbAdapter } from '../../repositories/offchain/supply/persistable-claim.adapter';
import { PersistableLockDbAdapter } from '../../repositories/offchain/supply/persistable-lock.adapter';
import { PersistableReceiptDbAdapter } from '../../repositories/offchain/supply/persistable-receipt.adapter';
import { KannaProvider } from '../../repositories/onchain/kanna.provider';
import { ClaimSupplyRpcAdapter } from '../../repositories/onchain/supply/claim-supply.adapter';
import { LockSupplyRpcAdapter } from '../../repositories/onchain/supply/lock-supply.adapter';

const disabled = {
  execute: async () => Promise.resolve(),
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
