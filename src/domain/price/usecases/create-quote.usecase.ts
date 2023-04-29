import { CreateQuoteDto, TransactionType } from '../dtos/create-quote.dto';
import { Quote } from '../entities/quote.entity';
import { CreateQuoteInteractor } from '../interactors/create-quote.interactor';
import { FetchableEthBasisPort } from '../ports/fetchable-eth-basis.port';
import { FetchableKnnBasisPort } from '../ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../ports/fetchable-usd-basis.port';
import { PersistableQuotePort } from '../ports/persistable-quote.port';
import { EthQuoteBasis } from '../value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../value-objects/usd-quote-basis.value-object';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../value-objects/currency-amount.value-object';
import { CalculusPort } from '../../price/ports/calculus.port';
import { FetchableGasPricePort } from '../ports/fetchable-gas-price.port';
import { Settings } from '../../common/settings';
import {
  validateDecimals,
  onlyCurrencies,
  onlyDigits,
} from '../../common/util';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';

export type QuotationAggregate = {
  [k in CurrencyIsoCode]: CurrencyAmount<k>;
};

export type CalculationStrategy = (
  amount: CurrencyAmount,
  usdQuotation: UsdQuoteBasis,
  knnQuotation: KnnQuoteBasis,
  ethQuotation: EthQuoteBasis,
) => QuotationAggregate;

const estimatedGasInWEI: Record<TransactionType, number> = {
  Transfer: 20_000,
  LockSupply: 37_800,
  Claim: 87_510,
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
    readonly gasPricePort: FetchableGasPricePort,
    readonly calculusPort: CalculusPort,
    readonly persistableQuotePort: PersistableQuotePort,
  ) {
    const supportedQuotationStrats: CalculationStrategyAggregate = {
      BRL: this.calculateBRL.bind(this),
      USD: this.calculateUSD.bind(this),
      ETH: this.calculateETH.bind(this),
      KNN: this.calculateKNN.bind(this),
      MATIC: this.calculateETH.bind(this), // TODO: CALCUULATE MATIC
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
      throw new Error('Invalid currency');
    }

    if (!validateDecimals(decimals)) {
      throw new Error('Invalid decimals');
    }
  };

  async execute(entry: CreateQuoteDto): Promise<Quote> {
    this.validateEntry(entry);

    const [ethBasis, knnBasis, usdBasis] = await Promise.all([
      this.ethPort.fetch(entry.forceReload),
      this.knnPort.fetch(entry.forceReload),
      this.usdPort.fetch(entry.forceReload),
    ]);

    const userEstimatedGasFee: QuotationAggregate = await this.calculateGas(
      entry,
      usdBasis,
      knnBasis,
      ethBasis,
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
    );

    const entryQuotation: QuotationAggregate = this.getQuotation[userCurrency](
      entry.amount,
      usdBasis,
      knnBasis,
      ethBasis,
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
        IsoCodeType.ETH,
      ),
    };

    return quote;
  }

  async calculateGas(
    entry: CreateQuoteDto,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): Promise<QuotationAggregate> {
    const gasPriceInETH = await this.gasPricePort.fetch(entry.forceReload);

    const transactionType = entry?.transactionType ?? 'Claim';

    const amountInWEI: CurrencyAmount = {
      unassignedNumber: estimatedGasInWEI[transactionType].toString(),
      decimals: 0,
      isoCode: IsoCodeType.ETH,
    };

    const amountInETH = this.calculusPort.multiply(
      amountInWEI,
      gasPriceInETH,
      IsoCodeType.ETH,
    );

    return this.calculateETH(
      amountInETH,
      usdQuotation,
      knnQuotation,
      ethQuotation,
    );
  }

  public calculateBRL(
    amountInBRL: CurrencyAmount<IsoCodeType.BRL>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): QuotationAggregate {
    let amountInUSD;

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      const usdQuotationInBRL = this.calculusPort.divide(
        ethQuotation.BRL,
        ethQuotation.USD,
        IsoCodeType.BRL,
      );

      amountInUSD = this.calculusPort.divide(
        amountInBRL,
        usdQuotationInBRL,
        IsoCodeType.USD,
      );

      return {
        BRL: amountInBRL,
        ETH: this.calculusPort.divide(
          amountInBRL,
          ethQuotation.BRL,
          IsoCodeType.ETH,
        ),
        USD: amountInUSD,
        KNN: this.calculusPort.divide(
          amountInUSD,
          knnQuotation.USD,
          IsoCodeType.KNN,
        ),
      };
    }

    amountInUSD = this.calculusPort.divide(
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

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
    };
  }

  public calculateUSD(
    amountInUSD: CurrencyAmount<IsoCodeType.USD>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): QuotationAggregate {
    let amountInBRL: CurrencyAmount<IsoCodeType.BRL>;

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      const usdQuotationInBRL = this.calculusPort.divide(
        ethQuotation.BRL,
        ethQuotation.USD,
        IsoCodeType.BRL,
      );

      amountInBRL = this.calculusPort.multiply(
        amountInUSD,
        usdQuotationInBRL,
        IsoCodeType.BRL,
      );

      return {
        BRL: amountInBRL,
        ETH: this.calculusPort.divide(
          amountInUSD,
          ethQuotation.USD,
          IsoCodeType.ETH,
        ),
        USD: amountInUSD,
        KNN: this.calculusPort.divide(
          amountInUSD,
          knnQuotation.USD,
          IsoCodeType.KNN,
        ),
      };
    }

    amountInBRL = this.calculusPort.multiply(
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

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
    };
  }

  public calculateKNN(
    amountInKNN: CurrencyAmount<IsoCodeType.KNN>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
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

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      return {
        BRL: this.calculusPort.multiply(
          amountInETH,
          ethQuotation.BRL,
          IsoCodeType.BRL,
        ),
        ETH: amountInETH,
        USD: amountInUSD,
        KNN: amountInKNN,
      };
    }

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
    };
  }

  public calculateETH(
    amountInETH: CurrencyAmount<IsoCodeType.ETH>,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
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

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      return {
        BRL: this.calculusPort.multiply(
          amountInETH,
          ethQuotation.BRL,
          IsoCodeType.BRL,
        ),
        ETH: amountInETH,
        USD: amountInUSD,
        KNN: amountInKNN,
      };
    }

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
    };
  }

  shouldUseFallback(
    usdQuotation: UsdQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): boolean {
    const fallbackAvailable =
      this.calculusPort.isPositive(ethQuotation.USD) &&
      this.calculusPort.isPositive(ethQuotation.BRL) &&
      ethQuotation.expiration > new Date();

    const isZero = !parseInt(usdQuotation.BRL.unassignedNumber, 10);

    const useFallback =
      this.calculusPort.isNegative(usdQuotation.BRL) || isZero;
    usdQuotation.expiration < new Date();

    if (useFallback && !fallbackAvailable) {
      throw new Error('No Price Fallback Available');
    }

    return useFallback;
  }
}
