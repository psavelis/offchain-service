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

export interface Ticker {
  pair: string;
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  open: string;
  date: number;
}

const KNOWN_KNNBRL_FLOOR = 1.1;
const KNOWN_KNNBRL_CEILING = 9.1;
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

    const { priceInBrl1e18, brlQuotation } = await this.getPriceWithFallback();

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

  private async getPriceWithFallback(): Promise<{
    priceInBrl1e18: BigNumber;
    brlQuotation: CurrencyAmount<'BRL'>;
  }> {
    try {
      return await this.getPrice();
    } catch (err) {
      console.error(`getPriceWithFallback: ${err?.message} @ ${err?.stack}`);

      return {
        priceInBrl1e18: BigNumber.from(
          this.settings.cex.mb.fallback.knnBrlFallbackUint256,
        ),
        brlQuotation: {
          unassignedNumber: this.settings.cex.mb.fallback.knnBrlFallbackUint256,
          decimals: DEFAULT_ETH_DECIMALS,
          isoCode: 'BRL',
        },
      };
    }
  }

  private async getPrice() {
    const endpoint = new URL(
      this.settings.cex.mb.endpoints.ticker,
      this.settings.cex.mb.host,
    ).toString();

    const tickers: Ticker[] =
      await FetchableKnnBasisMBHttpAdapter.cexClient.get<Ticker[]>(endpoint);

    const filtered = tickers.filter((item) => item.pair === 'KNN-BRL');

    const ceiling = Math.max(
      ...filtered.map((item) =>
        Math.max(
          parseFloat(item.last),
          parseFloat(item.buy),
          parseFloat(item.sell),
        ),
      ),
    );

    FetchableKnnBasisMBHttpAdapter.validateCeiling(ceiling);

    const priceInBrl1e18: BigNumber = this.get1e18UnassignedNumber(
      Number(ceiling),
    );

    const brlQuotation: CurrencyAmount<'BRL'> = {
      unassignedNumber: priceInBrl1e18.toString(),
      decimals: DEFAULT_ETH_DECIMALS,
      isoCode: 'BRL',
    };

    return { priceInBrl1e18, brlQuotation };
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

  static validateCeiling(ceiling: number): void {
    if (ceiling < KNOWN_KNNBRL_FLOOR) {
      const msg = `Ceiling: ${ceiling} is LOWER than KNOWN_KNNBRL_FLOOR: ${KNOWN_KNNBRL_FLOOR}`;

      throw new Error(msg);
    }

    if (ceiling > KNOWN_KNNBRL_CEILING) {
      const msg = `Ceiling: ${ceiling} is HIGHER than KNOWN_KNNBRL_CEILING: ${KNOWN_KNNBRL_CEILING}`;

      throw new Error(msg);
    }
  }
}
