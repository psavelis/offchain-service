import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableOrderDbAdapter } from '../../adapters/outbound/database/order/fetchable-order.adapter';
import { GeneratePixQrCodeAdapter } from '../../adapters/outbound/qrcodes/order/generate-pix-qrcode.adapter';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { FetchOrderInteractor } from '../../../domain/order/interactors/fetch-order.interactor';

import { FetchBrazilianPixOrderUseCase } from '../../../domain/order/usecases/fetch-brazilian-pix-order.usecase';
import { CreateQuoteFactory } from '../price/create-quote.factory';

export class FetchOrderFactory {
  static instance: FetchOrderInteractor;

  static getInstance(): FetchOrderInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const fetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();
      const generatePixPort = GeneratePixQrCodeAdapter.getInstance(settings);

      this.instance = new FetchBrazilianPixOrderUseCase(
        settings,
        creteQuoteInboundPort,
        fetchableOrderPort,
        generatePixPort,
      );
    }

    return this.instance;
  }
}
