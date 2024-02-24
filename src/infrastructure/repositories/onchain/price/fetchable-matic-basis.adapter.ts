import {utils, FixedNumber} from 'ethers';
import {type CurrencyAmount} from '../../../../domain/price/value-objects/currency-amount.value-object';
import {type IChainlinkProtocolProvider} from '../polygon-chainlink.provider';
import {type MaticQuoteBasis} from '../../../../domain/price/value-objects/matic-quote-basis.value-object';
import {type FetchableMaticBasisPort} from '../../../../domain/price/ports/fetchable-matic-basis.port';

const MATIC_QUOTATION_DECIMALS = 18;
const CACHE_TTL_MS = 1_000 * 60 * 15;

export class FetchableMaticBasisJsonRpcAdapter
implements FetchableMaticBasisPort {
  static instance: FetchableMaticBasisPort;
  static cachedBasis: MaticQuoteBasis | undefined;

  private constructor(readonly provider: IChainlinkProtocolProvider) {
    FetchableMaticBasisJsonRpcAdapter.cachedBasis = null;
  }

  static getCachedBasis(): MaticQuoteBasis | undefined {
    if (
      FetchableMaticBasisJsonRpcAdapter.cachedBasis &&
      FetchableMaticBasisJsonRpcAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableMaticBasisJsonRpcAdapter.cachedBasis;
    }

    return null;
  }

  static getInstance(provider: IChainlinkProtocolProvider) {
    if (!FetchableMaticBasisJsonRpcAdapter.instance) {
      FetchableMaticBasisJsonRpcAdapter.instance =
        new FetchableMaticBasisJsonRpcAdapter(provider);
    }

    return FetchableMaticBasisJsonRpcAdapter.instance;
  }

  async fetch(forceReload = false): Promise<MaticQuoteBasis> {
    const cached = FetchableMaticBasisJsonRpcAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    const quotationBasis: MaticQuoteBasis = {
      USD: await this.fetchMaticUsd(),
      ETH: await this.fetchMaticEth(),
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    FetchableMaticBasisJsonRpcAdapter.cachedBasis = quotationBasis;

    return quotationBasis;
  }

  async fetchMaticUsd(): Promise<CurrencyAmount<'USD'>> {
    const priceFeed = await this.provider.getFeed('matic-usd');

    const {answer} = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();

    const quotationBasis: CurrencyAmount<'USD'> = {
      unassignedNumber: answer.toString(),
      decimals,
      isoCode: 'USD',
    };

    const invalidQuotation = FixedNumber.fromValue(
      answer.toString(),
      decimals,
      'ufixed128x18',
    )
      .subUnsafe(
        FixedNumber.fromValue(
          utils.parseUnits('0.1', MATIC_QUOTATION_DECIMALS),
          MATIC_QUOTATION_DECIMALS,
          'ufixed128x18',
        ),
      )
      .isNegative();

    if (invalidQuotation) {
      throw new Error(
        `[chainlink][matic-usd] Invalid roundData '${answer}' (decimals: ${decimals})`,
      );
    }

    return quotationBasis;
  }

  async fetchMaticEth(): Promise<CurrencyAmount<'ETH'>> {
    const priceFeed = await this.provider.getFeed('matic-eth');

    const {answer} = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();

    const quotationBasis: CurrencyAmount<'ETH'> = {
      unassignedNumber: answer.toString(),
      decimals,
      isoCode: 'ETH',
    };

    const invalidQuotation = FixedNumber.fromValue(
      answer.toString(),
      decimals,
      'ufixed128x18',
    )
      .subUnsafe(
        FixedNumber.fromValue(
          utils.parseUnits('0.00000001', MATIC_QUOTATION_DECIMALS),
          MATIC_QUOTATION_DECIMALS,
          'ufixed128x18',
        ),
      )
      .isNegative();

    if (invalidQuotation) {
      throw new Error(
        `[chainlink][matic-eth] Invalid roundData '${answer}' (decimals: ${decimals})`,
      );
    }

    return quotationBasis;
  }
}
