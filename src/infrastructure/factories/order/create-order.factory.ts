import {type Settings} from '../../../domain/common/settings';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {PersistableOrderDbAdapter} from '../../repositories/offchain/order/persistable-order.adapter';
import {PixQrCodeAdapter} from '../../adapters/identifiers/qr-codes/pix/pix-qrcode.adapter';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {type CreateOrderInteractor} from '../../../domain/order/interactors/create-order.interactor';

import {CreateBrazilianPixOrderUseCase} from '../../../domain/order/usecases/create-brazilian-pix-order.usecase';
import {CreateQuoteFactory} from '../price/create-quote.factory';
import {type LoggablePort} from '../../../domain/common/ports/loggable.port';
import Logger from '../../adapters/logging/logger';
import {Aes256EncryptionAdapter} from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import {type EncryptionPort} from '../../../domain/common/ports/encryption.port';

export class CreateOrderFactory {
  static instance: CreateOrderInteractor;

  static getInstance(): CreateOrderInteractor {
    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableOrderPort =
        PersistableOrderDbAdapter.getInstance(knexPostgresDb);

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();
      const generatePixPort = PixQrCodeAdapter.getInstance(settings);

      const encryptionPort: EncryptionPort =
        Aes256EncryptionAdapter.getInstance();

      this.instance = new CreateBrazilianPixOrderUseCase(
        logger,
        settings,
        encryptionPort,
        creteQuoteInboundPort,
        persistableOrderPort,
        generatePixPort,
      );
    }

    return this.instance;
  }
}
