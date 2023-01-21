import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { PersistableOrderDbAdapter } from '../../adapters/outbound/database/order/persistable-order.adapter';
import { GeneratePixQrCodeAdapter } from '../../adapters/outbound/qrcodes/order/generate-pix-qrcode.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { CreateOrderInteractor } from '../../../domain/order/interactors/create-order.interactor';

import { CreateBrazilianPixOrderUseCase } from '../../../domain/order/usecases/create-brazilian-pix-order.usecase';
import { CreateQuoteFactory } from '../price/create-quote.factory';
import { LoggablePort } from 'src/domain/common/ports/loggable.port';
import { MailerPort } from 'src/domain/common/ports/mailer.port';
import PinoLogger from 'src/infrastructure/adapters/outbound/log/logger';
import Mailer from 'src/infrastructure/adapters/outbound/smtp/mailer.adapter';

export class CreateOrderFactory {
  static instance: CreateOrderInteractor;

  static getInstance(): CreateOrderInteractor {
    if (!this.instance) {
      const logger: LoggablePort = PinoLogger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const mailer: MailerPort = Mailer.getInstance(settings);
      const persistableOrderPort =
        PersistableOrderDbAdapter.getInstance(knexPostgresDb);

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();
      const generatePixPort = GeneratePixQrCodeAdapter.getInstance(settings);

      this.instance = new CreateBrazilianPixOrderUseCase(
        logger,
        settings,
        creteQuoteInboundPort,
        persistableOrderPort,
        generatePixPort,
        mailer
      );
    }

    return this.instance;
  }
}
