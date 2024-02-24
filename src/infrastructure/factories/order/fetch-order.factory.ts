import {type Settings} from '../../../domain/common/settings';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {FetchableOrderDbAdapter} from '../../repositories/offchain/order/fetchable-order.adapter';
import {PixQrCodeAdapter} from '../../adapters/identifiers/qr-codes/pix/pix-qrcode.adapter';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {type FetchOrderInteractor} from '../../../domain/order/interactors/fetch-order.interactor';

import {FetchBrazilianPixOrderUseCase} from '../../../domain/order/usecases/fetch-brazilian-pix-order.usecase';
import {CreateQuoteFactory} from '../price/create-quote.factory';

export class FetchOrderFactory {
  static instance: FetchOrderInteractor;

  static getInstance(): FetchOrderInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const fetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();
      const generatePixPort = PixQrCodeAdapter.getInstance(settings);

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
