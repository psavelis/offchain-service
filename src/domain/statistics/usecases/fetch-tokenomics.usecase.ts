import {IsoCodeType} from '../../common/enums/iso-codes.enum';
import {type Settings} from '../../common/settings';
import {formatDecimals} from '../../common/util';
import {type KnnToCurrenciesInteractor} from '../../price/interactors/knn-to-currencies.interactor';
import {type KnnSummaryDto} from '../dtos/knn-summary.dto';
import {type LockedOrdersSummaryDto} from '../dtos/locked-orders-summary.dto';
import {type TokenomicsDto} from '../dtos/tokenomics.dto';
import {type FetchableKnnSummaryPort} from '../ports/fetchable-knn-summary.port';
import {type FetchableLockedOrdersSummaryPort} from '../ports/fetchable-locked-orders-summary.port';
import {type CurrencyAmount} from '../../price/value-objects/currency-amount.value-object';
import {type QuotationAggregate} from '../../price/value-objects/quotation-aggregate.value-object';
import {LayerType} from '../../common/enums/layer-type.enum';
import {NetworkType} from '../../common/enums/network-type.enum';
import {type FetchTokenomicsInteractor} from '../interactors/fetch-tokenomics.interactor';

const DEFAULT_CACHE_TIME = 1000 * 60 * 2; // 2min
const decimals = 8;

const mintDate = new Date('2022-12-14T03:41:35.000Z');
const maxSupply = 19_000_000;
const totalSupply = 10_000_000;

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
      this.getPrice().catch(() => null),
      this.fetchKnnSummaryPort.fetch(),
      this.fetchLockedOrdersSumaryPort.fetch(),
    ]);

    const [
      marketCap,
      totalValueLocked,
      fullyDilutedMarketCap,
      circulatingSupplyMarketCap,
    ] = await Promise.all([
      this.getMarketCap(knnSummary, lockedOrdersSummary).catch(() => null),
      this.getTotalValueLocked(knnSummary, lockedOrdersSummary).catch(
        () => null,
      ),
      this.getFullyDilutedMarketCap(knnSummary).catch(() => null),
      this.getCirculatingSupplyMarketCap(knnSummary).catch(() => null),
    ]);

    lockedOrdersSummary.lockedTokens.totalAmount += knnSummary.stockOption;
    lockedOrdersSummary.lockedTokens.stockOptionPool = knnSummary.stockOption;

    const tokenomics: TokenomicsDto = {
      mintDate,
      maxSupply,
      ...knnSummary,
      totalSupply,
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

  private getNetworks(): Array<{
		chainId: number;
		name: string;
	}> {
    const isSingleLayer =
      this.settings.blockchain.current.layer === LayerType.L1;

    const isProd = process.env.NODE_ENV === 'production';

    const current = {
      name: NetworkType[this.settings.blockchain.current.id],
      chainId: this.settings.blockchain.current.id,
    };

    const networks = isSingleLayer
      ? [current]
      : [
        {
          name: NetworkType[
            isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia
          ],
          chainId: isProd
            ? NetworkType.Ethereum
            : NetworkType.EthereumSepolia,
        },
        current,
      ];

    return networks;
  }

  async getMarketCap(
    {holders, stockOption}: KnnSummaryDto,
    lockedOrdersSummary: LockedOrdersSummaryDto,
  ) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(
        holders.totalAmount +
          lockedOrdersSummary.lockedTokens.totalAmount +
          stockOption,
      ),
    );

    return this.parseAggregation(aggregate);
  }

  async getFullyDilutedMarketCap({totalSupply}: KnnSummaryDto) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(totalSupply),
    );

    return this.parseAggregation(aggregate);
  }

  async getCirculatingSupplyMarketCap({circulatingSupply}: KnnSummaryDto) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(circulatingSupply),
    );

    return this.parseAggregation(aggregate);
  }

  async getTotalValueLocked(
    knnSummary: KnnSummaryDto,
    lockedOrdersSummary: LockedOrdersSummaryDto,
  ) {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(
        lockedOrdersSummary.lockedTokens.totalAmount + knnSummary.stockOption,
      ),
    );

    return this.parseAggregation(aggregate);
  }

  async getPrice() {
    const aggregate = await this.knnToCurrenciesInteractor.execute(
      this.toKNN(1),
    );

    return this.parseAggregation(aggregate);
  }

  async parseAggregation({USD, BRL, MATIC, ETH}: QuotationAggregate) {
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
