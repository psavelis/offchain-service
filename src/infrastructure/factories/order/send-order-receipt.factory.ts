import {type Settings} from '../../../domain/common/settings';
import {type LoggablePort} from '../../../domain/common/ports/loggable.port';
import {type EncryptionPort} from '../../../domain/common/ports/encryption.port';
import {type MailerPort} from '../../../domain/common/ports/mailer.port';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {FetchableOrderDbAdapter} from '../../repositories/offchain/order/fetchable-order.adapter';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {type SendOrderReceiptInteractor} from '../../../domain/order/interactors/send-order-receipt.interactor';
import {Aes256EncryptionAdapter} from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import Mailer from '../../adapters/mailing/mailer.adapter';
import Logger from '../../adapters/logging/logger';

import {SendOrderReceiptUseCase} from '../../../domain/order/usecases/send-order-receipt.usecase';

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
      const encryptionPort: EncryptionPort =
        Aes256EncryptionAdapter.getInstance();

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
