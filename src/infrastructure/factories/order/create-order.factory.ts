import { Settings } from '../../../domain/common/settings';
import { CreateQuoteInteractor } from '../../../domain/price/interactors/create-quote.interactor';
import { CreateQuoteUseCase } from '../../../domain/price/usecases/create-quote.usecase';
import { FixedPointCalculusAdapter } from '../../adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableEthBasisHttpAdapter } from '../../adapters/outbound/http/price/fetchable-eth-basis.adapter';
import { FetchableUsdBasisHttpAdapter } from '../../adapters/outbound/http/price/fetchable-usd-basis.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { FetchableGasPriceJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-gas-price.adapter';
import { FetchableKnnBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-knn-basis.adapter';
import { PersistableOrderDbAdapter } from '../../adapters/outbound/database/order/persistable-order.adapter';
import { GeneratePixQrCodeAdapter } from '../../adapters/outbound/qrcodes/order/generate-pix-qrcode.adapter';
import { KnexPostgresDatabase } from 'src/infrastructure/adapters/outbound/database/knex-postgres.db';
import { CreateOrderInteractor } from 'src/domain/order/interactors/create-order.interactor';

import { CreateBrazilianPixOrderUseCase } from 'src/domain/order/usecases/create-brazilian-pix-order.usecase';
import { CreateQuoteFactory } from '../price/create-quote.factory';

export class CreateOrderFactory {
  static instance: CreateOrderInteractor;

  static getInstance(): CreateOrderInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableOrderPort =
        PersistableOrderDbAdapter.getInstance(knexPostgresDb);

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();
      const generatePixPort = GeneratePixQrCodeAdapter.getInstance(settings);

      this.instance = new CreateBrazilianPixOrderUseCase(
        creteQuoteInboundPort,
        persistableOrderPort,
        generatePixPort,
      );
    }

    return this.instance;
  }
}
