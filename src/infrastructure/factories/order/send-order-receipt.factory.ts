import { Settings } from '../../../domain/common/settings';
import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import { EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { MailerPort } from '../../../domain/common/ports/mailer.port';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { SendOrderReceiptInteractor } from '../../../domain/order/interactors/send-order-receipt.interactor';
import { EncryptionAdapter } from '../../adapters/outbound/encryption/encryption.adapter';
import Mailer from '../../adapters/outbound/smtp/mailer.adapter';
import Logger from '../../adapters/outbound/log/logger';

import { SendOrderReceiptUseCase } from '../../../domain/order/usecases/send-order-receipt.usecase';


export class SendOrderReceiptFactory {
  static instance: SendOrderReceiptInteractor;

  static getInstance(): SendOrderReceiptInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const fetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const logger: LoggablePort = Logger.getInstance();
      const mailer: MailerPort = Mailer.getInstance(settings);
      const encryptionPort: EncryptionPort = EncryptionAdapter.getInstance();

      this.instance = new SendOrderReceiptUseCase(
        settings,
        fetchableOrderPort,
        encryptionPort,
        mailer,
        logger,
      );
    }

    return this.instance;
  }
}
