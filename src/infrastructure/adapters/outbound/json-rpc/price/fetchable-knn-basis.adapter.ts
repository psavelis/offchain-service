import { utils } from 'ethers';
import { FetchableKnnBasisPort } from '../../../../../domain/price/ports/fetchable-knn-basis.port';
import { KnnQuoteBasis } from '../../../../../domain/price/value-objects/knn-quote-basis.value-object';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';

const ETH_QUOTATION_DECIMALS = 18;
const CHAINLINK_USD_QUOTATION_DECIMALS = 8;
const CACHE_TTL_MS = 1_000 * 900;

export class FetchableKnnBasisJsonRpcAdapter implements FetchableKnnBasisPort {
  static instance: FetchableKnnBasisPort;
  static cachedBasis: KnnQuoteBasis | null;

  private constructor(readonly provider: IKannaProtocolProvider) {
    FetchableKnnBasisJsonRpcAdapter.cachedBasis = null;
  }

  static getCachedBasis(): KnnQuoteBasis | null {
    if (
      FetchableKnnBasisJsonRpcAdapter.cachedBasis &&
      FetchableKnnBasisJsonRpcAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableKnnBasisJsonRpcAdapter.cachedBasis;
    }

    return null;
  }

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableKnnBasisJsonRpcAdapter.instance) {
      FetchableKnnBasisJsonRpcAdapter.instance =
        new FetchableKnnBasisJsonRpcAdapter(provider);
    }

    return FetchableKnnBasisJsonRpcAdapter.instance;
  }

  async fetch(forceReload: boolean = false): Promise<KnnQuoteBasis> {
    const cached = FetchableKnnBasisJsonRpcAdapter.getCachedBasis();

    if (cached) {
      return cached;
    }

    const presale: KannaPreSale = await this.provider.sale();

    const [priceInChainLinkUsd1e8, [priceInWei1e18, usdQuotation]] =
      await Promise.all([
        presale.knnPriceInUSD(),
        presale.convertToWEI(utils.parseUnits('1.0', ETH_QUOTATION_DECIMALS)),
      ]);

    const quotationBasis: KnnQuoteBasis = {
      USD: {
        unassignedNumber: priceInChainLinkUsd1e8.toString(),
        decimals: CHAINLINK_USD_QUOTATION_DECIMALS,
        isoCode: 'USD',
      },
      ETH: {
        unassignedNumber: priceInWei1e18.toString(),
        decimals: ETH_QUOTATION_DECIMALS,
        isoCode: 'ETH',
      },
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    FetchableKnnBasisJsonRpcAdapter.cachedBasis = quotationBasis;

    return quotationBasis;
  }
}
