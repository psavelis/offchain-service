import { FetchableKnnBasisPort } from '../../../../../domain/price/ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../../../../../domain/price/ports/fetchable-usd-basis.port';
import { FetchableEthBasisPort } from '../../../../../domain/price/ports/fetchable-eth-basis.port';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { Settings } from '../../../../../domain/common/settings';
import { BigNumber, FixedNumber } from 'ethers';

import { KnnQuoteBasis } from '../../../../../domain/price/value-objects/knn-quote-basis.value-object';
import { MBHttpClient } from '../clients/mb/mb.http-client';

export interface TradingOrderResponse {
  items: TradingOrder[];
}

export interface TradingOrder {
  id: string;
  instrument: string;
  qty: string;
  side: string;
  type: string;
  filledQty: string;
  limitPrice: number;
  status: string;
  created_at: number;
  updated_at: number;
}

const KNOWN_KNNBRL_FLOOR = 1;
const KNOWN_KNNBRL_CEILING = 9;
const CACHE_TTL_MS = 30 * 1e3;
const DEFAULT_ETH_DECIMALS = 18;

export class FetchableKnnBasisMBHttpAdapter implements FetchableKnnBasisPort {
  static instance: FetchableKnnBasisPort;
  static cachedBasis: KnnQuoteBasis | null;
  static cexClient: MBHttpClient;

  private constructor(
    readonly fetchableUsdBasisPort: FetchableUsdBasisPort,
    readonly fetchableEthBasisPort: FetchableEthBasisPort,
    readonly settings: Settings,
  ) {
    FetchableKnnBasisMBHttpAdapter.cachedBasis = null;
  }

  static getInstance(
    fetchableUsdBasisPort: FetchableUsdBasisPort,
    fetchableEthBasisPort: FetchableEthBasisPort,
    settings: Settings,
  ) {
    if (!FetchableKnnBasisMBHttpAdapter.instance) {
      FetchableKnnBasisMBHttpAdapter.instance =
        new FetchableKnnBasisMBHttpAdapter(
          fetchableUsdBasisPort,
          fetchableEthBasisPort,
          settings,
        );

      FetchableKnnBasisMBHttpAdapter.cexClient =
        MBHttpClient.getInstance(settings);
    }

    return FetchableKnnBasisMBHttpAdapter.instance;
  }

  static getCachedBasis(): KnnQuoteBasis | null {
    if (
      FetchableKnnBasisMBHttpAdapter.cachedBasis &&
      FetchableKnnBasisMBHttpAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableKnnBasisMBHttpAdapter.cachedBasis;
    }

    return null;
  }

  async fetch(forceReload: boolean = false): Promise<KnnQuoteBasis> {
    const cached = FetchableKnnBasisMBHttpAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    const endpoint = new URL(
      this.settings.cex.mb.endpoints.tradingOrders,
      this.settings.cex.mb.host,
    ).toString();

    const tradingOrders: TradingOrderResponse =
      await FetchableKnnBasisMBHttpAdapter.cexClient.get<TradingOrderResponse>(
        endpoint,
      );

    if (!tradingOrders?.items?.length) {
      throw new Error('No trading orders returned from MB');
    }

    const lastTradingOrder: TradingOrder = tradingOrders.items
      .filter(
        (order) =>
          order.instrument === 'KNN-BRL' &&
          order.side === 'sell' &&
          order.status === 'filled',
      )
      .sort((a, b) => b.created_at - a.created_at)[0];

    FetchableKnnBasisMBHttpAdapter.validateTradingOrder(lastTradingOrder);

    const priceInBrl1e18: BigNumber = this.get1e18UnassignedNumber(
      lastTradingOrder.limitPrice,
    );

    const brlQuotation: CurrencyAmount<'BRL'> = {
      unassignedNumber: priceInBrl1e18.toString(),
      decimals: DEFAULT_ETH_DECIMALS,
      isoCode: 'BRL',
    };

    const [usdQuoteBasis, ethQuoteBasis] = await Promise.all([
      this.fetchableUsdBasisPort.fetch(),
      this.fetchableEthBasisPort.fetch(),
    ]);

    const knnInUSD = BigNumber.from(
      FixedNumber.fromValue(
        priceInBrl1e18,
        brlQuotation.decimals,
        'ufixed128x18',
      ).divUnsafe(
        FixedNumber.fromValue(
          BigNumber.from(usdQuoteBasis.BRL.unassignedNumber),
          usdQuoteBasis.BRL.decimals,
          'ufixed128x18',
        ),
      ),
    );

    const knnInETH = BigNumber.from(
      FixedNumber.fromValue(knnInUSD, 18, 'ufixed128x18').divUnsafe(
        FixedNumber.fromValue(
          BigNumber.from(ethQuoteBasis.USD.unassignedNumber),
          ethQuoteBasis.USD.decimals,
          'ufixed128x18',
        ),
      ),
    );

    FetchableKnnBasisMBHttpAdapter.cachedBasis = {
      USD: {
        unassignedNumber: knnInUSD.toString(),
        decimals: DEFAULT_ETH_DECIMALS,
        isoCode: 'USD',
      },
      ETH: {
        unassignedNumber: knnInETH.toString(),
        decimals: DEFAULT_ETH_DECIMALS,
        isoCode: 'ETH',
      },
      expiration: new Date(new Date().getTime() + CACHE_TTL_MS),
    };

    return FetchableKnnBasisMBHttpAdapter.cachedBasis;
  }

  private get1e18UnassignedNumber(value: number | string): BigNumber {
    const stringValue = value.toString();
    const [wholePart, decimalPart = ''] = stringValue.split('.');
    const wholeWei = BigNumber.from(wholePart).mul(
      BigNumber.from('1000000000000000000'),
    );

    const paddedDecimal = decimalPart.padEnd(18, '0').substring(0, 18);

    const totalWei = wholeWei.add(BigNumber.from(paddedDecimal));

    return totalWei.abs();
  }

  static validateTradingOrder({ limitPrice }: TradingOrder): void {
    if (limitPrice < KNOWN_KNNBRL_FLOOR) {
      const msg = `LimitPrice: ${limitPrice} is LOWER than KNOWN_KNNBRL_FLOOR: ${KNOWN_KNNBRL_FLOOR}`;

      throw new Error(msg);
    }

    if (limitPrice > KNOWN_KNNBRL_CEILING) {
      const msg = `LimitPrice: ${limitPrice} is HIGHER than KNOWN_KNNBRL_CEILING: ${KNOWN_KNNBRL_CEILING}`;

      throw new Error(msg);
    }
  }
}
