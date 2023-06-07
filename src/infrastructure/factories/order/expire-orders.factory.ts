import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { ExpireOrdersInteractor } from '../../../domain/order/interactors/expire-orders.interactor';
import { ExpireOrdersUseCase } from '../../../domain/order/usecases/expire-orders.usecase';
import { MailerPort } from '../../../domain/common/ports/mailer.port';
import Mailer from '../../adapters/outbound/smtp/mailer.adapter';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { PersistableOrderStatusTransitionDbAdapter } from '../../adapters/outbound/database/order/persistable-order-status-transition.adapter';
import { PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { Aes256EncryptionAdapter } from '../../adapters/outbound/encryption/aes256/aes-256-encryption.adapter';
import { FetchableOrderPort } from '../../../domain/order/ports/fetchable-order.port';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';

const disabled = {
  execute: () => Promise.resolve(),
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
