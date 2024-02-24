import { BigNumber, FixedNumber, utils } from 'ethers';
import { type FetchableEthBasisPort } from '../../../../domain/price/ports/fetchable-eth-basis.port';
import { type CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';
import { type EthQuoteBasis } from '../../../../domain/price/value-objects/eth-quote-basis.value-object';
import { type IChainlinkProtocolProvider } from '../ethereum-chainlink.provider';

const ETH_QUOTATION_DECIMALS = 18;
const CACHE_TTL_MS = 1_000 * 900;

export class FetchableEthBasisJsonRpcAdapter implements FetchableEthBasisPort {
  static instance: FetchableEthBasisPort;
  static cachedBasis: EthQuoteBasis | undefined;

  private constructor(readonly provider: IChainlinkProtocolProvider) {
    FetchableEthBasisJsonRpcAdapter.cachedBasis = null;
  }

  static getCachedBasis(): EthQuoteBasis | undefined {
    if (
      FetchableEthBasisJsonRpcAdapter.cachedBasis &&
      FetchableEthBasisJsonRpcAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableEthBasisJsonRpcAdapter.cachedBasis;
    }

    return null;
  }

  static getInstance(provider: IChainlinkProtocolProvider) {
    if (!FetchableEthBasisJsonRpcAdapter.instance) {
      FetchableEthBasisJsonRpcAdapter.instance =
        new FetchableEthBasisJsonRpcAdapter(provider);
    }

    return FetchableEthBasisJsonRpcAdapter.instance;
  }

  async fetch(): Promise<EthQuoteBasis> {
    const cached = FetchableEthBasisJsonRpcAdapter.getCachedBasis();

    if (cached) {
      return cached;
    }

    const quotationBasis: EthQuoteBasis = {
      USD: await this.fetchEthUsd(),
      BRL: await this.fetchBrlUsd(),
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    FetchableEthBasisJsonRpcAdapter.cachedBasis = quotationBasis;

    return quotationBasis;
  }

  async fetchEthUsd(): Promise<CurrencyAmount<'USD'>> {
    const priceFeed = await this.provider.getFeed('eth-usd');

    const { answer } = await priceFeed.latestRoundData();
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
          utils.parseUnits('1000.0', ETH_QUOTATION_DECIMALS),
          ETH_QUOTATION_DECIMALS,
          'ufixed128x18',
        ),
      )
      .isNegative();

    if (invalidQuotation) {
      throw new Error(
        `[chainlink][eth-usd] Invalid roundData '${answer}' (decimals: ${decimals})`,
      );
    }

    return quotationBasis;
  }

  async fetchBrlUsd(): Promise<CurrencyAmount<'BRL'>> {
    const priceFeed = await this.provider.getFeed('brl-usd');

    const { answer } = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();

    const priceFeedUsd = await this.provider.getFeed('eth-usd');
    const { answer: answerUsd } = await priceFeedUsd.latestRoundData();
    const decimalsUsd = await priceFeedUsd.decimals();

    const fixed = BigNumber.from(
      FixedNumber.fromValue(
        answerUsd.toString(),
        decimalsUsd,
        'ufixed128x18',
      ).divUnsafe(
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
          utils.parseUnits('6900.0', ETH_QUOTATION_DECIMALS),
          ETH_QUOTATION_DECIMALS,
          'ufixed128x18',
        ),
      )
      .isNegative();

    if (invalidQuotation) {
      throw new Error(
        `[chainlink][brl-usd] Invalid roundData '${answer}' (decimals: ${decimals}) [USD: '${answerUsd}' (decimals: ${decimalsUsd})]`,
      );
    }

    return quotationBasis;
  }
}
