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
} from '../../common/util';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';

const NO_PRICE_FALLBACK_AVAILABLE = 'No Price Fallback Available';

const isoCodeForGasInMATIC = [
  IsoCodeType.BRL,
  IsoCodeType.USD,
  IsoCodeType.KNN,
  IsoCodeType.MATIC,
];

const isoCodeForGasInETH = [IsoCodeType.ETH];

export type QuotationAggregate = {
  [k in CurrencyIsoCode]: CurrencyAmount<k>;
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

  validateEntry = ({
    amount: { unassignedNumber, isoCode, decimals },
  }: CreateQuoteDto): void => {
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
  };

  async execute(entry: CreateQuoteDto): Promise<Quote> {
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

    let entryAmount: CurrencyAmount<CurrencyIsoCode> = entry.amount;

    if (userCurrency === IsoCodeType.BRL || userCurrency === IsoCodeType.USD) {
      entryAmount = this.calculusPort.sub(
        entry.amount,
        userEstimatedGasFee[userCurrency],
      );
    } else if (userCurrency === IsoCodeType.KNN) {
      entryAmount = this.calculusPort.sum(
        entry.amount,
        userEstimatedGasFee[userCurrency],
      );
    }

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
        quote.total.ETH,
        quote.finalAmountOfTokens,
        IsoCodeType.MATIC,
      ),
    };

    return quote;
  }

  async calculateGas(
    entry: CreateQuoteDto,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
    maticQuotation: MaticQuoteBasis,
  ): Promise<QuotationAggregate> {
    const transactionType = entry?.transactionType ?? 'Claim';

    if (isoCodeForGasInMATIC.includes(IsoCodeType[entry.amount.isoCode])) {
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

    const amountInMATIC = this.calculusPort.multiply(
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

    const amountInMATIC = this.calculusPort.multiply(
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

    const amountInMATIC = this.calculusPort.multiply(
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

    const amountInMATIC = this.calculusPort.multiply(
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
