import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { Settings } from '../../common/settings';
import { formatDecimals } from '../../common/util';
import { KnnToCurrenciesInteractor } from '../../price/interactors/knn-to-currencies.interactor';
import { KnnSummaryDto } from '../dtos/knn-summary.dto';
import { LockedOrdersSummaryDto } from '../dtos/locked-orders-summary.dto';
import { TokenomicsDto } from '../dtos/tokenomics.dto';
import { FetchableKnnSummaryPort } from '../ports/fetchable-knn-summary.port';
import { FetchableLockedOrdersSummaryPort } from '../ports/fetchable-locked-orders-summary.port';
import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import { QuotationAggregate } from '../../price/value-objects/quotation-aggregate.value-object';
import { LayerType } from '../../common/enums/layer-type.enum';
import { NetworkType } from '../../common/enums/network-type.enum';
import { FetchTokenomicsInteractor } from '../interactors/fetch-tokenomics.interactor';

const DEFAULT_CACHE_TIME = 1000 * 60 * 5; // 5min
const decimals = 8;

const mintDate = new Date('2022-12-14T03:41:35.000Z');
const maxSupply = 19_000_000;

export class FetchTokenomicsUseCase implements FetchTokenomicsInteractor {
  static cache: {
    due: Date;
    data: TokenomicsDto;
  };

  constructor(
    readonly settings: Settings,
    readonly fetchKnnSummaryPort: FetchableKnnSummaryPort,
    readonly fetchLockedOrdersSumaryPort: FetchableLockedOrdersSummaryPort,
    readonly knnToCurrenciesInteractor: KnnToCurrenciesInteractor,
  ) {}

  async execute(): Promise<TokenomicsDto> {
    if (FetchTokenomicsUseCase.cacheIsValid()) {
      return FetchTokenomicsUseCase.cache.data;
    }

    const [price, knnSummary, lockedOrdersSummary] = await Promise.all([
      this.getPrice(),
      this.fetchKnnSummaryPort.fetch(),
      this.fetchLockedOrdersSumaryPort.fetch(),
    ]);

    const [
      marketCap,
      totalValueLocked,
      fullyDilutedMarketCap,
      circulatingSupplyMarketCap,
    ] = await Promise.all([
      this.getMarketCap(knnSummary, lockedOrdersSummary),
      this.getTotalValueLocked(knnSummary, lockedOrdersSummary),
      this.getFullyDilutedMarketCap(knnSummary),
      this.getCirculatingSupplyMarketCap(knnSummary),
    ]);

    const tokenomics: TokenomicsDto = {
      mintDate,
      maxSupply,
      ...knnSummary,
      ...lockedOrdersSummary,
      totalValueLocked,
      price,
      marketCap,
      fullyDilutedMarketCap,
      circulatingSupplyMarketCap,
      networks: this.getNetworks(),
      contracts: this.getContracts(),
    };

    FetchTokenomicsUseCase.cache = {
      data: tokenomics,
      due: new Date(Date.now() + DEFAULT_CACHE_TIME),
    };

    return tokenomics;
  }

  private getContracts(): Record<
    string,
    {
      token: string;
      treasury: string;
      sale: string;
      presale?: string | undefined;
      yieldPool?: string | undefined;
      carbonPool?: string | undefined;
      stockOptionPool?: string | undefined;
    }
  > {
    const isSingleLayer =
      this.settings.blockchain.current.layer === LayerType.L1;

    const ehtereumContracts = {
      token: this.settings.blockchain.ethereum.contracts.tokenAddress,
      treasury: this.settings.blockchain.ethereum.contracts.gnosisSafeAddress,
      sale: this.settings.blockchain.ethereum.contracts.saleAddress,
      presale: this.settings.blockchain.ethereum.contracts.legacyPreSaleAddress,
    };

    if (isSingleLayer) {
      return {
        [NetworkType[NetworkType.Ethereum]]: ehtereumContracts,
      };
    }

    return {
      [NetworkType[NetworkType.Ethereum]]: ehtereumContracts,
      [NetworkType[NetworkType.Polygon]]: {
        token: this.settings.blockchain.polygon.contracts.fxTokenAddress,
        treasury: this.settings.blockchain.polygon.contracts.gnosisSafeAddress,
        sale: this.settings.blockchain.polygon.contracts.saleAddress,
      },
    };
  }

  private getNetworks(): string[] {
    const isSingleLayer =
      this.settings.blockchain.current.layer === LayerType.L1;

    const isProd = process.env.NODE_ENV === 'production';

    const current = NetworkType[this.settings.blockchain.current.id];

    const networks = isSingleLayer
      ? [current]
      : [
          NetworkType[
            isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia
          ],
          current,
        ];

    return networks;
  }

  async getMarketCap(
    { holders }: KnnSummaryDto,
    lockedOrdersSummary: LockedOrdersSummaryDto,
  ) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(
        holders.totalAmount + lockedOrdersSummary.lockedTokens.totalAmount,
      ),
    );

    return this.parseAggregation(aggregate);
  }

  async getFullyDilutedMarketCap({ totalSupply }: KnnSummaryDto) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(totalSupply),
    );

    return this.parseAggregation(aggregate);
  }

  async getCirculatingSupplyMarketCap({ circulatingSupply }: KnnSummaryDto) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(circulatingSupply),
    );

    return this.parseAggregation(aggregate);
  }

  async getTotalValueLocked(
    knnSummary: KnnSummaryDto,
    lockedOrdersSummary: LockedOrdersSummaryDto,
  ) {
    const totalOrdersLocked = lockedOrdersSummary.lockedTokens.totalAmount;

    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(totalOrdersLocked),
    );

    return this.parseAggregation(aggregate);
  }

  async getPrice() {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(1),
    );

    return this.parseAggregation(aggregate);
  }

  async parseAggregation({ USD, BRL, MATIC, ETH }: QuotationAggregate) {
    return {
      ETH: this.toNumber(ETH.unassignedNumber, ETH.decimals),
      USD: this.toNumber(USD.unassignedNumber, USD.decimals),
      BRL: this.toNumber(BRL.unassignedNumber, BRL.decimals),
      MATIC: this.toNumber(MATIC.unassignedNumber, MATIC.decimals),
    };
  }

  private toKNN(totalLocked: number): CurrencyAmount<IsoCodeType.KNN> {
    return {
      unassignedNumber: this.toUnassigned(totalLocked),
      isoCode: IsoCodeType.KNN,
      decimals,
    };
  }

  private toUnassigned(numberValue: number): string {
    return numberValue.toFixed(decimals).replace(/\D/g, '');
  }

  private toNumber(unassigned: string, decimalPrecision: number): number {
    return Number(
      formatDecimals(unassigned, decimalPrecision, {
        truncateDecimals: decimals,
      }),
    );
  }

  static cacheIsValid() {
    return (
      FetchTokenomicsUseCase.cache &&
      FetchTokenomicsUseCase.cache.due > new Date()
    );
  }
}
