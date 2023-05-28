import { CreateQuoteDto, TransactionType } from '../dtos/create-quote.dto';
import { Quote } from '../entities/quote.entity';
import { CreateQuoteInteractor } from '../interactors/create-quote.interactor';
import { FetchableEthBasisPort } from '../ports/fetchable-eth-basis.port';
import { FetchableMaticBasisPort } from '../ports/fetchable-matic-basis.port';
import { FetchableKnnBasisPort } from '../ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../ports/fetchable-usd-basis.port';
import { PersistableQuotePort } from '../ports/persistable-quote.port';

import { EthQuoteBasis } from '../value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../value-objects/usd-quote-basis.value-object';
import { MaticQuoteBasis } from '../value-objects/matic-quote-basis.value-object';

import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../value-objects/currency-amount.value-object';
import { CalculusPort } from '../../price/ports/calculus.port';
import { FetchableEthereumGasPricePort } from '../ports/fetchable-ethereum-gas-price.port';
import { FetchablePolygonGasPricePort } from '../ports/fetchable-polygon-gas-price.port';
import { Settings } from '../../common/settings';
import {
  validateDecimals,
  onlyCurrencies,
  onlyDigits,
  formatDecimals,
} from '../../common/util';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { Chain } from '../../common/entities/chain.entity';
import { LayerType } from '../../common/enums/layer-type.enum';
import { NetworkType } from '../..//common/enums/network-type.enum';

import { QuotationAggregate } from '../value-objects/quotation-aggregate.value-object';

const NO_PRICE_FALLBACK_AVAILABLE = 'No Price Fallback Available';
const ZERO_CURRENCY_AMOUNT: QuotationAggregate = {
  BRL: {
    unassignedNumber: '0',
    decimals: 0,
    isoCode: IsoCodeType.BRL,
  },
  ETH: {
    unassignedNumber: '0',
    decimals: 0,
    isoCode: IsoCodeType.ETH,
  },
  USD: {
    unassignedNumber: '0',
    decimals: 0,
    isoCode: IsoCodeType.USD,
  },
  KNN: {
    unassignedNumber: '0',
    decimals: 0,
    isoCode: IsoCodeType.KNN,
  },
  MATIC: {
    unassignedNumber: '0',
    decimals: 0,
    isoCode: IsoCodeType.MATIC,
  },
};

export type CalculationStrategy = (
  amount: CurrencyAmount,
  usdQuotation: UsdQuoteBasis,
  knnQuotation: KnnQuoteBasis,
  ethQuotation: EthQuoteBasis,
  maticQuotation: EthQuoteBasis,
) => QuotationAggregate;

const estimatedGasInWEI: Record<TransactionType, number> = {
  Transfer: 20_000,
  LockSupply: 37_800,
  Claim: 87_510,
};

const estimatedGasInMATIC: Record<TransactionType, number> = {
  Transfer: 20_000,
  LockSupply: 37_800, // TODO: mudar para o valor de gas do contrato da polygon
  Claim: 87_510, // TODO: mudar para o valor de gas do contrato da polygon
};

const DEFAULT_ORDER_MINIMUM_TOTAL = Number(process.env.MINIMUM_PRICE) || 60;
const DEFAULT_BRL_TRUNCATE_OPTIONS = {
  truncateDecimals: 2,
};

export interface CalculationStrategyAggregate
  extends Record<CurrencyIsoCode, CalculationStrategy> {}

export class CreateQuoteUseCase implements CreateQuoteInteractor {
  private getQuotation: CalculationStrategyAggregate;

  constructor(
    readonly settings: Settings,
    readonly ethPort: FetchableEthBasisPort,
    readonly knnPort: FetchableKnnBasisPort,
    readonly usdPort: FetchableUsdBasisPort,
    readonly maticPort: FetchableMaticBasisPort,
    readonly ethereumGasPricePort: FetchableEthereumGasPricePort,
    readonly polygonGasPricePort: FetchablePolygonGasPricePort,
    readonly calculusPort: CalculusPort,
    readonly persistableQuotePort: PersistableQuotePort,
  ) {
    const supportedQuotationStrats: CalculationStrategyAggregate = {
      BRL: this.calculateBRL.bind(this),
      USD: this.calculateUSD.bind(this),
      ETH: this.calculateETH.bind(this),
      KNN: this.calculateKNN.bind(this),
      MATIC: this.calculateMATIC.bind(this),
    };

    this.getQuotation = supportedQuotationStrats;
  }

  validateEntry = ({ amount, chainId }: CreateQuoteDto): void => {
    const { unassignedNumber, isoCode, decimals } = amount;
    if (!onlyDigits.test(unassignedNumber)) {
      throw new Error('Invalid amount');
    }

    if (!onlyCurrencies.test(isoCode)) {
      throw new Error('Invalid isoCode input');
    }

    if (!validateDecimals(decimals)) {
      throw new Error('Invalid decimals');
    }

    if (!Object.keys(IsoCodeType).includes(isoCode)) {
      throw new Error('Invalid currency');
    }

    if (isoCode === IsoCodeType.BRL) {
      CreateQuoteUseCase.validateMinimumAmount(amount);
    }

    if (!chainId) {
      throw new Error('chainId not informed!');
    } else if (!onlyDigits.test(String(chainId)) || !NetworkType[chainId]) {
      throw new Error('Invalid chainId');
    }

    const chain = new Chain(chainId);
    if (amount.isoCode === IsoCodeType.ETH && chain.layer !== LayerType.L1) {
      throw new Error('Invalid isoCode for L1 chain');
    } else if (
      amount.isoCode === IsoCodeType.MATIC &&
      chain.layer !== LayerType.L2
    ) {
      throw new Error('Invalid isoCode for L2 chain');
    }
  };

  private static validateMinimumAmount(
    amount: CurrencyAmount<CurrencyIsoCode>,
  ) {
    const truncated = Number(
      formatDecimals(
        amount.unassignedNumber,
        amount.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    if (truncated < DEFAULT_ORDER_MINIMUM_TOTAL) {
      throw new Error('amount below minimum total');
    }
  }

  async execute(entry: CreateQuoteDto): Promise<Quote> {
    const shouldEnforceChainId =
      !entry.chainId && this.settings.blockchain.current.layer === LayerType.L1;

    if (shouldEnforceChainId) {
      entry.chainId = this.settings.blockchain.current.id;
    }

    this.validateEntry(entry);

    const [ethBasis, knnBasis, usdBasis, maticBasis] = await Promise.all([
      this.ethPort.fetch(entry.forceReload),
      this.knnPort.fetch(entry.forceReload),
      this.usdPort.fetch(entry.forceReload),
      this.maticPort.fetch(entry.forceReload),
    ]);

    const userEstimatedGasFee: QuotationAggregate = await this.calculateGas(
      entry,
      usdBasis,
      knnBasis,
      ethBasis,
      maticBasis,
    );

    const {
      amount: { isoCode: userCurrency },
    } = entry;

    const entryAmount: CurrencyAmount<CurrencyIsoCode> =
      this.prepareEntryAmount(entry, userCurrency, userEstimatedGasFee);

    const userQuotation: QuotationAggregate = this.getQuotation[userCurrency](
      entryAmount,
      usdBasis,
      knnBasis,
      ethBasis,
      maticBasis,
    );

    const entryQuotation: QuotationAggregate = this.getQuotation[userCurrency](
      entry.amount,
      usdBasis,
      knnBasis,
      ethBasis,
      maticBasis,
    );

    const quote = {} as Quote;

    quote.userAmount = entry.amount;

    quote.chainId = entry.chainId;
    quote.transactionType = entry?.transactionType ?? 'Claim';

    quote.finalAmountOfTokens =
      userCurrency === IsoCodeType.KNN
        ? {
            ...entry.amount,
            isoCode: IsoCodeType.KNN,
          }
        : {
            ...userQuotation.KNN,
            isoCode: IsoCodeType.KNN,
          };

    quote.createdAt = new Date();
    quote.expiresAt = new Date(
      quote.createdAt.getTime() +
        this.settings.price.quoteExpirationSeconds * 1_000,
    );

    quote.gasAmount = userEstimatedGasFee;

    quote.total = entryQuotation;

    CreateQuoteUseCase.validateMinimumAmount(quote.total.BRL);

    quote.netTotal = userQuotation;

    quote.totalPerToken = {
      USD: this.calculusPort.divide(
        quote.total.USD,
        quote.finalAmountOfTokens,
        IsoCodeType.USD,
      ),
      ETH: this.calculusPort.divide(
        quote.total.ETH,
        quote.finalAmountOfTokens,
        IsoCodeType.ETH,
      ),
      BRL: this.calculusPort.divide(
        quote.total.BRL,
        quote.finalAmountOfTokens,
        IsoCodeType.BRL,
      ),
      MATIC: this.calculusPort.divide(
        quote.total.MATIC,
        quote.finalAmountOfTokens,
        IsoCodeType.MATIC,
      ),
    };

    return quote;
  }

  private prepareEntryAmount(
    entry: CreateQuoteDto,
    userCurrency: string,
    userEstimatedGasFee: QuotationAggregate,
  ) {
    let entryAmount: CurrencyAmount<CurrencyIsoCode> = entry.amount;

    if (userCurrency === IsoCodeType.BRL || userCurrency === IsoCodeType.USD) {
      const gasFee = userEstimatedGasFee[userCurrency];
      try {
        entryAmount = this.calculusPort.sub(entry.amount, gasFee);
      } catch (err) {
        {
          if (err.message?.includes('negative')) {
            const message = `Gas fee (${formatDecimals(
              gasFee.unassignedNumber,
              gasFee.decimals,
              DEFAULT_BRL_TRUNCATE_OPTIONS,
            )} ${
              entryAmount.isoCode
            }) is higher than the amount (${formatDecimals(
              entryAmount.unassignedNumber,
              entryAmount.decimals,
              DEFAULT_BRL_TRUNCATE_OPTIONS,
            )} ${entryAmount.isoCode}) entered. (${err.message})`;

            throw new Error(message);
          }

          throw err;
        }
      }
    } else if (userCurrency === IsoCodeType.KNN) {
      entryAmount = this.calculusPort.sum(
        entry.amount,
        userEstimatedGasFee[userCurrency],
      );
    }
    return entryAmount;
  }

  async calculateGas(
    entry: CreateQuoteDto,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): Promise<QuotationAggregate> {
    const transactionType = entry?.transactionType ?? 'Claim';

    if (new Chain(entry.chainId).layer === LayerType.L2) {
      // TODO: remover ao final da campanha
      if (transactionType !== 'Transfer') {
        return ZERO_CURRENCY_AMOUNT;
      }

      const polygonGasPriceInMATIC = await this.polygonGasPricePort.fetch(
        entry.forceReload,
      );
      const amountInWEI: CurrencyAmount = {
        unassignedNumber: estimatedGasInMATIC[transactionType].toString(),
        decimals: 0,
        isoCode: IsoCodeType.MATIC,
      };

      const amountInMATIC = this.calculusPort.multiply(
        amountInWEI,
        polygonGasPriceInMATIC,
        IsoCodeType.MATIC,
      );

      return this.calculateMATIC(
        amountInMATIC,
        usdQuotation,
        knnQuotation,
        ethQuotation,
        maticQuotation,
      );
    }

    const ethereumGasPriceInETH = await this.ethereumGasPricePort.fetch(
      entry.forceReload,
    );

    const amountInWEI: CurrencyAmount = {
      unassignedNumber: estimatedGasInWEI[transactionType].toString(),
      decimals: 0,
      isoCode: IsoCodeType.ETH,
    };

    const amountInETH = this.calculusPort.multiply(
      amountInWEI,
      ethereumGasPriceInETH,
      IsoCodeType.ETH,
    );

    return this.calculateETH(
      amountInETH,
      usdQuotation,
      knnQuotation,
      ethQuotation,
      maticQuotation,
    );
  }

  public calculateBRL(
    amountInBRL: CurrencyAmount<IsoCodeType.BRL>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    _: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): QuotationAggregate {
    const amountInUSD = this.calculusPort.divide(
      amountInBRL,
      usdQuotation.BRL,
      IsoCodeType.USD,
    );

    const amountInKNN = this.calculusPort.divide(
      amountInUSD,
      knnQuotation.USD,
      IsoCodeType.KNN,
    );

    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodeType.ETH,
    );

    const amountInMATIC = this.calculusPort.divide(
      amountInETH,
      maticQuotation.ETH,
      IsoCodeType.MATIC,
    );

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
      MATIC: amountInMATIC,
    };
  }

  public calculateUSD(
    amountInUSD: CurrencyAmount<IsoCodeType.USD>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    _: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): QuotationAggregate {
    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodeType.BRL,
    );

    const amountInKNN = this.calculusPort.divide(
      amountInUSD,
      knnQuotation.USD,
      IsoCodeType.KNN,
    );

    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodeType.ETH,
    );

    const amountInMATIC = this.calculusPort.divide(
      amountInETH,
      maticQuotation.ETH,
      IsoCodeType.MATIC,
    );

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
      MATIC: amountInMATIC,
    };
  }

  public calculateKNN(
    amountInKNN: CurrencyAmount<IsoCodeType.KNN>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    _: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): QuotationAggregate {
    const amountInUSD = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.USD,
      IsoCodeType.USD,
    );

    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodeType.ETH,
    );

    const amountInMATIC = this.calculusPort.divide(
      amountInETH,
      maticQuotation.ETH,
      IsoCodeType.MATIC,
    );

    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodeType.BRL,
    );

    return {
      BRL: amountInBRL,
      ETH: amountInETH,
      USD: amountInUSD,
      KNN: amountInKNN,
      MATIC: amountInMATIC,
    };
  }

  public calculateETH(
    amountInETH: CurrencyAmount<IsoCodeType.ETH>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    _: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): QuotationAggregate {
    const amountInKNN = this.calculusPort.divide(
      amountInETH,
      knnQuotation.ETH,
      IsoCodeType.KNN,
    );

    const amountInUSD = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.USD,
      IsoCodeType.USD,
    );

    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodeType.BRL,
    );

    const amountInMATIC = this.calculusPort.divide(
      amountInETH,
      maticQuotation.ETH,
      IsoCodeType.MATIC,
    );

    return {
      BRL: amountInBRL,
      ETH: amountInETH,
      USD: amountInUSD,
      KNN: amountInKNN,
      MATIC: amountInMATIC,
    };
  }

  public calculateMATIC(
    amountInMATIC: CurrencyAmount<IsoCodeType.MATIC>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    _: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): QuotationAggregate {
    const amountInETH = this.calculusPort.multiply(
      amountInMATIC,
      maticQuotation.ETH,
      IsoCodeType.ETH,
    );

    const amountInKNN = this.calculusPort.divide(
      amountInETH,
      knnQuotation.ETH,
      IsoCodeType.KNN,
    );

    const amountInUSD = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.USD,
      IsoCodeType.USD,
    );

    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodeType.BRL,
    );

    return {
      BRL: amountInBRL,
      ETH: amountInETH,
      USD: amountInUSD,
      KNN: amountInKNN,
      MATIC: amountInMATIC,
    };
  }

  shouldUseFallback(usdQuotation: UsdQuoteBasis): boolean {
    const isZero = !parseInt(usdQuotation.BRL.unassignedNumber, 10);

    const useFallback =
      this.calculusPort.isNegative(usdQuotation.BRL) || isZero;
    usdQuotation.expiration < new Date();

    if (useFallback) {
      throw new Error(NO_PRICE_FALLBACK_AVAILABLE);
    }

    return useFallback;
  }
}
