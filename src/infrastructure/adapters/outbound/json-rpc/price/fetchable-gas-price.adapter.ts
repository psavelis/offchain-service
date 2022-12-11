import { FetchableGasPricePort } from '../../../../../domain/price/ports/fetchable-gas-price.port';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { Network, Alchemy, AlchemySettings } from 'alchemy-sdk';
import { Settings } from '../../../../../domain/common/settings';

export class FetchableGasPriceJsonRpcAdapter implements FetchableGasPricePort {
  static instance: FetchableGasPricePort;
  static cachedAmount: CurrencyAmount;
  static cacheExpiration: Date;
  private readonly alchemyInstance: Alchemy;

  private constructor(readonly alchemySettings: AlchemySettings) {
    this.alchemyInstance = new Alchemy(alchemySettings);
    FetchableGasPriceJsonRpcAdapter.cachedAmount = null;
  }

  static getInstance(settings: Settings) {
    if (!FetchableGasPriceJsonRpcAdapter.instance) {
      FetchableGasPriceJsonRpcAdapter.instance =
        new FetchableGasPriceJsonRpcAdapter({
          network: settings.blockchain.network as Network,
          apiKey: settings.blockchain.providerApiKey,
        });
    }

    return FetchableGasPriceJsonRpcAdapter.instance;
  }

  static getCachedBasis(): CurrencyAmount {
    if (
      FetchableGasPriceJsonRpcAdapter.cachedAmount &&
      FetchableGasPriceJsonRpcAdapter.cacheExpiration > new Date()
    ) {
      return FetchableGasPriceJsonRpcAdapter.cachedAmount;
    }

    return null;
  }

  async fetch(forceReload: boolean = false): Promise<CurrencyAmount> {
    const cached = FetchableGasPriceJsonRpcAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    const feeData = await this.alchemyInstance.core.getFeeData();

    FetchableGasPriceJsonRpcAdapter.cachedAmount = {
      unassignedNumber: feeData.maxFeePerGas.toString(),
      decimals: 18,
      isoCode: 'ETH',
    };

    FetchableGasPriceJsonRpcAdapter.cacheExpiration = new Date(
      new Date().getTime() + 1_000 * 10,
    );

    return FetchableGasPriceJsonRpcAdapter.cachedAmount;
  }
}
