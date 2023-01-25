import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { PersistableOrderDbAdapter } from '../../adapters/outbound/database/order/persistable-order.adapter';
import { GeneratePixQrCodeAdapter } from '../../adapters/outbound/qrcodes/order/generate-pix-qrcode.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { CreateOrderInteractor } from '../../../domain/order/interactors/create-order.interactor';

import { CreateBrazilianPixOrderUseCase } from '../../../domain/order/usecases/create-brazilian-pix-order.usecase';
import { CreateQuoteFactory } from '../price/create-quote.factory';
import { LoggablePort } from 'src/domain/common/ports/loggable.port';
import Logger from 'src/infrastructure/adapters/outbound/log/logger';
import { EncryptionAdapter } from 'src/infrastructure/adapters/outbound/encryption/encryption.adapter';
import { EncryptionPort } from 'src/domain/common/ports/encryption.port';

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
      const generatePixPort = GeneratePixQrCodeAdapter.getInstance(settings);

      const encryptionPort: EncryptionPort = EncryptionAdapter.getInstance();

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
