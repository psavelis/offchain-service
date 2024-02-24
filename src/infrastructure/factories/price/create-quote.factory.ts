import {type Settings} from '../../../domain/common/settings';
import {type CreateQuoteInteractor} from '../../../domain/price/interactors/create-quote.interactor';
import {CreateQuoteUseCase} from '../../../domain/price/usecases/create-quote.usecase';
import {FixedPointCalculusAdapter} from '../../adapters/unsupported-types/uint256/calculus/fixed-point-calculus.adapter';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {FetchableEthBasisJsonRpcAdapter} from '../../repositories/onchain/price/fetchable-eth-basis.adapter';
import {FetchableMaticBasisJsonRpcAdapter} from '../../repositories/onchain/price/fetchable-matic-basis.adapter';
import {FetchableUsdBasisJsonRpcAdapter} from '../../repositories/onchain/price/fetchable-usd-basis.adapter';
import {FetchableEthereumGasPriceJsonRpcAdapter} from '../../repositories/onchain/price/fetchable-ethereum-gas-price.adapter';
import {FetchablePolygonGasPriceJsonRpcAdapter} from '../../repositories/onchain/price/fetchable-polygon-gas-price.adapter';
import {FetchableKnnBasisMBHttpAdapter} from '../../adapters/apis/price/fetchable-knn-basis-mb.adapter';
import {PersistableQuoteDbAdapter} from '../../repositories/offchain/price/persistable-quote.adapter';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {EthereumChainlinkProvider} from '../../repositories/onchain/ethereum-chainlink.provider';
import {PolygonChainlinkProvider} from '../../repositories/onchain/polygon-chainlink.provider';
import {ChainlinkFeedProvider} from '../../repositories/onchain/chainlink-feed.provider';

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
