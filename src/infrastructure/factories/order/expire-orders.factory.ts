import { type EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { type MailerPort } from '../../../domain/common/ports/mailer.port';
import { type Settings } from '../../../domain/common/settings';
import { type CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { type ExpireOrdersInteractor } from '../../../domain/order/interactors/expire-orders.interactor';
import { type FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { type PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { ExpireOrdersUseCase } from '../../../domain/order/usecases/expire-orders.usecase';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';
import { Aes256EncryptionAdapter } from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import Mailer from '../../adapters/mailing/mailer.adapter';
import { KnexPostgresDatabase } from '../../repositories/offchain/knex-postgres.db';
import { FetchableOrderDbAdapter } from '../../repositories/offchain/order/fetchable-order.adapter';
import { PersistableOrderStatusTransitionDbAdapter } from '../../repositories/offchain/order/persistable-order-status-transition.adapter';

const disabled = {
  execute: async () => Promise.resolve(),
};
export class ExpireOrdersFactory {
  static instance: ExpireOrdersInteractor;

  static getInstance(): ExpireOrdersInteractor {
    const loadAdapter = process.env.LOAD_ADAPTERS?.includes('expiration-cron');

    if (!loadAdapter) {
      return disabled;
    }

    if (!ExpireOrdersFactory.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const mailer: MailerPort = Mailer.getInstance(settings);
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort =
        PersistableOrderStatusTransitionDbAdapter.getInstance(knexPostgresDb);

      const createOrderTransitionInteractor: CreateOrderTransitionInteractor =
        new CreateOrderStatusTransitionUseCase(
          persistableOrderStatusTransitionPort,
        );
      const encryptionPort: EncryptionPort =
        Aes256EncryptionAdapter.getInstance();

      const fetchableOrderPort: FetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      ExpireOrdersFactory.instance = new ExpireOrdersUseCase(
        settings,
        mailer,
        encryptionPort,
        createOrderTransitionInteractor,
        fetchableOrderPort,
      );
    }

    return ExpireOrdersFactory.instance;
  }
}
