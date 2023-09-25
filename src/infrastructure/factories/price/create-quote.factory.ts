import { Settings } from '../../../domain/common/settings';
import { CreateQuoteInteractor } from '../../../domain/price/interactors/create-quote.interactor';
import { CreateQuoteUseCase } from '../../../domain/price/usecases/create-quote.usecase';
import { FixedPointCalculusAdapter } from '../../adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableEthBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-eth-basis.adapter';
import { FetchableMaticBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-matic-basis.adapter';
import { FetchableUsdBasisJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-usd-basis.adapter';
import { FetchableEthereumGasPriceJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-ethereum-gas-price.adapter';
import { FetchablePolygonGasPriceJsonRpcAdapter } from '../../adapters/outbound/json-rpc/price/fetchable-polygon-gas-price.adapter';
import { FetchableKnnBasisMBHttpAdapter } from '../../adapters/outbound/http/price/fetchable-knn-basis-mb.adapter';
import { PersistableQuoteDbAdapter } from '../../adapters/outbound/database/price/persistable-quote.adapter';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { EthereumChainlinkProvider } from '../../adapters/outbound/json-rpc/ethereum-chainlink.provider';
import { PolygonChainlinkProvider } from '../../adapters/outbound/json-rpc/polygon-chainlink.provider';
import { ChainlinkFeedProvider } from '../../adapters/outbound/json-rpc/chainlink-feed.provider';

export class CreateQuoteFactory {
  static instance: CreateQuoteInteractor;

  static getInstance(): CreateQuoteInteractor {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const ethereumChainlinkProvider =
        EthereumChainlinkProvider.getInstance(settings);

      const polygonChainlinkProvider =
        PolygonChainlinkProvider.getInstance(settings);

      const multichainChainlinkProvider = ChainlinkFeedProvider.getInstance(
        ethereumChainlinkProvider,
        polygonChainlinkProvider,
      );

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const calculusAdapter = FixedPointCalculusAdapter.getInstance();

      const ethereumGasAdapter =
        FetchableEthereumGasPriceJsonRpcAdapter.getInstance(settings);

      const polygonGasAdapter =
        FetchablePolygonGasPriceJsonRpcAdapter.getInstance(settings);

      const usdAdapter = FetchableUsdBasisJsonRpcAdapter.getInstance(
        multichainChainlinkProvider,
      );

      const ethAdapter = FetchableEthBasisJsonRpcAdapter.getInstance(
        multichainChainlinkProvider,
      );

      const maticAdapter = FetchableMaticBasisJsonRpcAdapter.getInstance(
        polygonChainlinkProvider,
      );

      const saveQuoteAdapter =
        PersistableQuoteDbAdapter.getInstance(knexPostgresDb);

      const knnAdapter = FetchableKnnBasisMBHttpAdapter.getInstance(
        usdAdapter,
        ethAdapter,
        settings,
      );

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
