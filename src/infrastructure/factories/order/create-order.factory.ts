import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { PersistableOrderDbAdapter } from '../../adapters/outbound/database/order/persistable-order.adapter';
import { GeneratePixQrCodeAdapter } from '../../adapters/outbound/qrcodes/order/generate-pix-qrcode.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { CreateOrderInteractor } from '../../../domain/order/interactors/create-order.interactor';

import { CreateBrazilianPixOrderUseCase } from '../../../domain/order/usecases/create-brazilian-pix-order.usecase';
import { CreateQuoteFactory } from '../price/create-quote.factory';
import { LoggablePort } from 'src/domain/common/ports/loggable.port';
import PinoLogger from 'src/infrastructure/adapters/outbound/log/logger';

export class CreateOrderFactory {
  static instance: CreateOrderInteractor;

  static getInstance(): CreateOrderInteractor {
    if (!this.instance) {
      const logger: LoggablePort = PinoLogger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
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
      );
    }

    return this.instance;
  }
}
