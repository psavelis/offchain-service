import { Alchemy, type AlchemySettings, type Network } from 'alchemy-sdk';
import { type Settings } from '../../../../domain/common/settings';
import { type FetchableEthereumGasPricePort } from '../../../../domain/price/ports/fetchable-ethereum-gas-price.port';
import { type CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';

export class FetchableEthereumGasPriceJsonRpcAdapter
  implements FetchableEthereumGasPricePort
{
  static instance: FetchableEthereumGasPricePort;
  static cachedAmount: CurrencyAmount;
  static cacheExpiration: Date;
  private readonly alchemyInstance: Alchemy;

  private constructor(readonly alchemySettings: AlchemySettings) {
    this.alchemyInstance = new Alchemy(alchemySettings);
    FetchableEthereumGasPriceJsonRpcAdapter.cachedAmount = null;
  }

  static getInstance(settings: Settings) {
    if (!FetchableEthereumGasPriceJsonRpcAdapter.instance) {
      FetchableEthereumGasPriceJsonRpcAdapter.instance =
        new FetchableEthereumGasPriceJsonRpcAdapter({
          network: settings.blockchain.ethereum.network as Network,
          apiKey: settings.blockchain.ethereum.providerApiKey,
        });
    }

    return FetchableEthereumGasPriceJsonRpcAdapter.instance;
  }

  static getCachedBasis(): CurrencyAmount {
    if (
      FetchableEthereumGasPriceJsonRpcAdapter.cachedAmount &&
      FetchableEthereumGasPriceJsonRpcAdapter.cacheExpiration > new Date()
    ) {
      return FetchableEthereumGasPriceJsonRpcAdapter.cachedAmount;
    }

    return null;
  }

  async fetch(forceReload = false): Promise<CurrencyAmount> {
    const cached = FetchableEthereumGasPriceJsonRpcAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    const feeData = await this.alchemyInstance.core.getFeeData();

    FetchableEthereumGasPriceJsonRpcAdapter.cachedAmount = {
      unassignedNumber: feeData.maxFeePerGas.toString(),
      decimals: 18,
      isoCode: 'ETH',
    };

    FetchableEthereumGasPriceJsonRpcAdapter.cacheExpiration = new Date(
      new Date().getTime() + 1_000 * 10,
    );

    return FetchableEthereumGasPriceJsonRpcAdapter.cachedAmount;
  }
}
