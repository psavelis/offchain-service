import { utils } from 'ethers';
import { FetchableUsdBasisPort } from '../../../../../domain/price/ports/fetchable-usd-basis.port';
import { UsdQuoteBasis } from '../../../../../domain/price/value-objects/usd-quote-basis.value-object';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';

const ETH_QUOTATION_DECIMALS = 18;
const CACHE_TTL_MS = 1_000 * 300;

export class FetchableUsdBasisJsonRpcAdapter implements FetchableUsdBasisPort {
  static instance: FetchableUsdBasisPort;
  static cachedBasis: UsdQuoteBasis | null;

  private constructor(readonly provider: IKannaProtocolProvider) {
    FetchableUsdBasisJsonRpcAdapter.cachedBasis = null;
  }

  static getCachedBasis(): UsdQuoteBasis | null {
    if (
      FetchableUsdBasisJsonRpcAdapter.cachedBasis &&
      FetchableUsdBasisJsonRpcAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableUsdBasisJsonRpcAdapter.cachedBasis;
    }

    return null;
  }

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableUsdBasisJsonRpcAdapter.instance) {
      FetchableUsdBasisJsonRpcAdapter.instance =
        new FetchableUsdBasisJsonRpcAdapter(provider);
    }

    return FetchableUsdBasisJsonRpcAdapter.instance;
  }

  async fetch(forceReload: boolean = false): Promise<UsdQuoteBasis> {
    const cached = FetchableUsdBasisJsonRpcAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    // TODO: ths.provider.chainlink();
    const presale: KannaPreSale = await this.provider.preSale();

    const [priceInChainLinkUsd1e8, [priceInWei1e18, usdQuotation]] =
      await Promise.all([
        presale.knnPriceInUSD(),
        presale.convertToWEI(utils.parseUnits('1.0', ETH_QUOTATION_DECIMALS)),
      ]);

    const quotationBasis: UsdQuoteBasis = {
      // BRL =>> https://data.chain.link/ethereum/mainnet/fiat/brl-usd $0.19192033 (1 / $0.19192033)
      BRL: {
        unassignedNumber: priceInWei1e18.toString(),
        decimals: ETH_QUOTATION_DECIMALS,
        isoCode: 'ETH',
      },
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    FetchableUsdBasisJsonRpcAdapter.cachedBasis = quotationBasis;

    return quotationBasis;
  }
}
