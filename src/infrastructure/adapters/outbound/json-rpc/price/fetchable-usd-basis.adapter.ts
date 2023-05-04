import { BigNumber, FixedNumber, utils } from 'ethers';
import { FetchableUsdBasisPort } from '../../../../../domain/price/ports/fetchable-usd-basis.port';
import { UsdQuoteBasis } from '../../../../../domain/price/value-objects/usd-quote-basis.value-object';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { IChainlinkProtocolProvider } from '../ethereum-chainlink.provider';

const ETH_QUOTATION_DECIMALS = 18;
const CACHE_TTL_MS = 1_000 * 900;

export class FetchableUsdBasisJsonRpcAdapter implements FetchableUsdBasisPort {
  static instance: FetchableUsdBasisPort;
  static cachedBasis: UsdQuoteBasis | null;

  private constructor(readonly provider: IChainlinkProtocolProvider) {
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

  static getInstance(provider: IChainlinkProtocolProvider) {
    if (!FetchableUsdBasisJsonRpcAdapter.instance) {
      FetchableUsdBasisJsonRpcAdapter.instance =
        new FetchableUsdBasisJsonRpcAdapter(provider);
    }

    return FetchableUsdBasisJsonRpcAdapter.instance;
  }

  async fetch(_: boolean = false): Promise<UsdQuoteBasis> {
    const cached = FetchableUsdBasisJsonRpcAdapter.getCachedBasis();

    if (cached) {
      return cached;
    }

    const quotationBasis: UsdQuoteBasis = {
      // BRL =>> https://data.chain.link/ethereum/mainnet/fiat/brl-usd $0.19192033 (1 / $0.19192033)
      BRL: await this.fetchBrlUsd(),
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    FetchableUsdBasisJsonRpcAdapter.cachedBasis = quotationBasis;

    return quotationBasis;
  }

  async fetchBrlUsd(): Promise<CurrencyAmount<'BRL'>> {
    const priceFeed = await this.provider.getFeed('brl-usd');

    const { answer } = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();

    const fixed = BigNumber.from(
      FixedNumber.fromValue(BigNumber.from(1), 0, 'ufixed128x18').divUnsafe(
        FixedNumber.fromValue(answer.toString(), decimals, 'ufixed128x18'),
      ),
    );

    const quotationBasis: CurrencyAmount<'BRL'> = {
      unassignedNumber: fixed.toString(),
      decimals: ETH_QUOTATION_DECIMALS,
      isoCode: 'BRL',
    };

    const invalidQuotation = FixedNumber.fromValue(
      fixed,
      decimals,
      'ufixed128x18',
    )
      .subUnsafe(
        FixedNumber.fromValue(
          utils.parseUnits('3.0', ETH_QUOTATION_DECIMALS),
          ETH_QUOTATION_DECIMALS,
          'ufixed128x18',
        ),
      )
      .isNegative();

    if (invalidQuotation) {
      throw new Error(
        `[chainlink][brl-usd] Invalid roundData '${answer}' (decimals: ${decimals})]`,
      );
    }

    return quotationBasis;
  }
}
