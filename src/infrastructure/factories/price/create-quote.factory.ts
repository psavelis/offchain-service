import { Settings } from '../../../domain/common/settings';
import { CreateQuoteInteractor } from '../../../domain/price/interactors/create-quote.interactor';
import { CreateQuoteUseCase } from '../../../domain/price/usecases/create-quote.usecase';
import { FixedPointCalculusAdapter } from '../../adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableEthBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-eth-basis.adapter';
import { FetchableMaticBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-matic-basis.adapter';
import { FetchableUsdBasisHttpAdapter } from '../../adapters/outbound/http/price/fetchable-usd-basis.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { FetchableEthereumGasPriceJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-ethereum-gas-price.adapter';
import { FetchablePolygonGasPriceJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-polygon-gas-price.adapter';
import { FetchableKnnBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-knn-basis.adapter';
import { PersistableQuoteDbAdapter } from '../../adapters/outbound/database/price/persistable-quote.adapter';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { EthereumChainlinkProvider } from '../../adapters/outbound/json-rpc/ethereum-chainlink.provider';
import { PolygonChainlinkProvider } from '../../adapters/outbound/json-rpc/polygon-chainlink.provider';

export class CreateQuoteFactory {
  static instance: CreateQuoteInteractor;

  static getInstance(): CreateQuoteInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const kannaProvider = KannaProvider.getInstance(settings);
      const ethereumChainlinkProvider =
        EthereumChainlinkProvider.getInstance(settings);

      const polygonChainlinkProvider =
        PolygonChainlinkProvider.getInstance(settings);

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const calculusAdapter = FixedPointCalculusAdapter.getInstance();

      const knnAdapter =
        FetchableKnnBasisJsonRpcAdapter.getInstance(kannaProvider);

      const ethereumGasAdapter =
        FetchableEthereumGasPriceJsonRpcAdapter.getInstance(settings);

      const polygonGasAdapter =
        FetchablePolygonGasPriceJsonRpcAdapter.getInstance(settings);

      const usdAdapter = FetchableUsdBasisHttpAdapter.getInstance();
      const ethAdapter = FetchableEthBasisJsonRpcAdapter.getInstance(
        ethereumChainlinkProvider,
      );

      const maticAdapter = FetchableMaticBasisJsonRpcAdapter.getInstance(
        polygonChainlinkProvider,
      );

      const saveQuoteAdapter =
        PersistableQuoteDbAdapter.getInstance(knexPostgresDb);

      this.instance = new CreateQuoteUseCase(
        settings,
        ethAdapter,
        knnAdapter,
        usdAdapter,
        maticAdapter,
        ethereumGasAdapter,
        polygonGasAdapter,
        calculusAdapter,
        saveQuoteAdapter,
      );
    }

    return this.instance;
  }
}
