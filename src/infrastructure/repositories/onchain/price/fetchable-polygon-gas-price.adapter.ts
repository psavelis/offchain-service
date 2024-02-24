import { Alchemy, type AlchemySettings, type Network } from 'alchemy-sdk';
import { type Settings } from '../../../../domain/common/settings';
import { type FetchablePolygonGasPricePort } from '../../../../domain/price/ports/fetchable-polygon-gas-price.port';
import { type CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';

export class FetchablePolygonGasPriceJsonRpcAdapter
  implements FetchablePolygonGasPricePort
{
  static instance: FetchablePolygonGasPricePort;
  static cachedAmount: CurrencyAmount;
  static cacheExpiration: Date;
  private readonly alchemyInstance: Alchemy;

  private constructor(readonly alchemySettings: AlchemySettings) {
    this.alchemyInstance = new Alchemy(alchemySettings);
  }

  static getInstance(settings: Settings) {
    if (!FetchablePolygonGasPriceJsonRpcAdapter.instance) {
      FetchablePolygonGasPriceJsonRpcAdapter.instance =
        new FetchablePolygonGasPriceJsonRpcAdapter({
          network: settings.blockchain.polygon.network as Network,
          apiKey: settings.blockchain.polygon.providerApiKey,
        });
    }

    return FetchablePolygonGasPriceJsonRpcAdapter.instance;
  }

  static getCachedBasis(): CurrencyAmount | undefined {
    if (
      FetchablePolygonGasPriceJsonRpcAdapter.cachedAmount &&
      FetchablePolygonGasPriceJsonRpcAdapter.cacheExpiration > new Date()
    ) {
      return FetchablePolygonGasPriceJsonRpcAdapter.cachedAmount;
    }

    return undefined;
  }

  async fetch(): Promise<CurrencyAmount> {
    const cached = FetchablePolygonGasPriceJsonRpcAdapter.getCachedBasis();

    if (cached) {
      return cached;
    }

    const feeData = await this.alchemyInstance.core.getFeeData();

    if (!feeData) {
      throw new Error('No fee data on polygon');
    }

    FetchablePolygonGasPriceJsonRpcAdapter.cachedAmount = {
      unassignedNumber: feeData.maxFeePerGas.toString(),
      decimals: 18,
      isoCode: 'MATIC',
    };

    FetchablePolygonGasPriceJsonRpcAdapter.cacheExpiration = new Date(
      new Date().getTime() + 1_000 * 60,
    );

    return FetchablePolygonGasPriceJsonRpcAdapter.cachedAmount;
  }
}
