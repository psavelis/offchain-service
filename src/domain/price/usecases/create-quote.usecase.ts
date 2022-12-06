import { CreateQuoteDto } from '../dtos/create-quote.dto';
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
  IsoCodes,
} from '../value-objects/currency-amount.value-object';
import { CalculusPort } from '../../price/ports/calculus.port';
import { FetchableGasPricePort } from '../ports/fetchable-gas-price.port';
import { Settings } from '../../common/settings';

export interface QuotationAggregate
  extends Record<CurrencyIsoCode, CurrencyAmount> {}

export type CalculationStrategy = (
  amount: CurrencyAmount,
  usdQuotation: UsdQuoteBasis,
  knnQuotation: KnnQuoteBasis,
  ethQuotation: EthQuoteBasis,
) => QuotationAggregate;

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
    };

    this.getQuotation = supportedQuotationStrats;

    // TODO: outbound port para gas
    // readonly estimateGasPort: EstimateGasPort,
  }

  async execute(entry: CreateQuoteDto): Promise<Quote> {
    console.time('fetch-basis');
    const [ethBasis, knnBasis, usdBasis] = await Promise.all([
      this.ethPort.fetch(),
      this.knnPort.fetch(),
      this.usdPort.fetch(),
    ]);
    console.timeEnd('fetch-basis');

    const {
      amount: {
        isoCode: userCurrency,
        decimals: userDecimals,
        unassignedNumber: userUnassignedNumber,
      },
    } = entry;

    const userQuotation: QuotationAggregate = this.getQuotation[userCurrency](
      entry.amount,
      usdBasis,
      knnBasis,
      ethBasis,
    );

    const userEstimatedGasFee: QuotationAggregate = await this.calculateGas(
      usdBasis,
      knnBasis,
      ethBasis,
    );

    const userGatewayFee: QuotationAggregate = await this.calculateGatewayFee(
      userQuotation,
      userEstimatedGasFee,
      usdBasis,
      knnBasis,
      ethBasis,
    );

    console.time('calculus');

    const quote = {} as Quote;
    quote.userCurrency = userCurrency;
    quote.userUnassignedNumber = userUnassignedNumber;
    quote.userDecimals = userDecimals;
    quote.userAmount = entry.amount;

    quote.netTotalInUserCurrency = userQuotation[userCurrency];
    quote.gasAmountInUserCurrency = userEstimatedGasFee[userCurrency];
    quote.gatewayAmountInUserCurrency = userGatewayFee[userCurrency];

    quote.grossTotalInUserCurrency = this.calculusPort.sum(
      quote.netTotalInUserCurrency,
      quote.gasAmountInUserCurrency,
    );

    quote.totalFeeAmountInUserCurrency = this.calculusPort.sum(
      quote.gasAmountInUserCurrency,
      quote.gatewayAmountInUserCurrency,
    );

    quote.totalInUserCurrency = this.calculusPort.sum(
      quote.grossTotalInUserCurrency,
      quote.gatewayAmountInUserCurrency,
    );

    quote.finalAmountOfTokens = {
      ...userQuotation.KNN,
      isoCode: IsoCodes.KNN,
    };

    quote.createdAt = new Date();
    quote.expiresAt = new Date(
      quote.createdAt.getTime() +
        this.settings.price.quoteExpirationSeconds * 1_000,
    );

    quote.netTotalInUsd = userQuotation.USD;
    quote.netTotalInEth = userQuotation.ETH;

    quote.netTotalInBrl = userQuotation.BRL;
    quote.gasAmountInBrl = userEstimatedGasFee.BRL;
    quote.gatewayAmountInBrl = userGatewayFee.BRL;

    quote.grossTotalInBrl = this.calculusPort.sum(
      quote.netTotalInBrl,
      quote.gasAmountInBrl,
    );

    quote.totalFeeAmountInBrl = this.calculusPort.sum(
      quote.gasAmountInBrl,
      quote.gatewayAmountInBrl,
    );

    quote.totalInBrl = this.calculusPort.sum(
      quote.grossTotalInBrl,
      quote.gatewayAmountInBrl,
    );

    quote.totalPerTokenInUserCurrency = this.calculusPort.divide(
      quote.totalInUserCurrency,
      quote.finalAmountOfTokens,
      userCurrency,
    );

    quote.totalPerTokenInBrl = this.calculusPort.divide(
      quote.totalInBrl,
      quote.finalAmountOfTokens,
      userCurrency,
    );

    console.timeEnd('calculus');

    return this.persistableQuotePort.save(quote).catch((e) => {
      console.log(e);
      return quote;
    });
  }

  private async calculateGatewayFee(
    userQuotation: QuotationAggregate,
    userEstimatedGasFee: QuotationAggregate,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): Promise<QuotationAggregate> {
    const gatewayFeeInBrl = await this.calculateGatewayFeeInBrl(
      userQuotation,
      userEstimatedGasFee,
    );

    return this.calculateBRL(
      gatewayFeeInBrl,
      usdQuotation,
      knnQuotation,
      ethQuotation,
    );
  }

  private calculateGatewayFeeInBrl(
    userQuotation: QuotationAggregate,
    userEstimatedGasFee: QuotationAggregate,
  ): Promise<CurrencyAmount> {
    const gatewayFeeInBrl: CurrencyAmount = {
      unassignedNumber: '1', // 0.01
      decimals: 2,
      isoCode: IsoCodes.BRL,
    }; // TODO: parametrizar calculo do gateway

    const result = this.calculusPort.multiply(
      this.calculusPort.sum(userQuotation.BRL, userEstimatedGasFee.BRL),
      gatewayFeeInBrl,
      IsoCodes.BRL,
    );

    return Promise.resolve(result);
  }

  async calculateGas(
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): Promise<QuotationAggregate> {
    console.time('calc-gas');
    const gasPriceInETH = await this.gasPricePort.fetch();

    const estimatedGasInWEI = 70_000 * 2; // TODO: env!

    const amountInWEI: CurrencyAmount = {
      unassignedNumber: estimatedGasInWEI.toString(),
      decimals: 0,
      isoCode: IsoCodes.ETH,
    };

    const amountInETH = this.calculusPort.multiply(
      amountInWEI,
      gasPriceInETH,
      IsoCodes.ETH,
    );

    console.timeEnd('calc-gas');

    return this.calculateETH(
      amountInETH,
      usdQuotation,
      knnQuotation,
      ethQuotation,
    );
  }

  public calculateBRL(
    amountInBRL: CurrencyAmount,
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
        IsoCodes.BRL,
      );

      amountInUSD = this.calculusPort.divide(
        amountInBRL,
        usdQuotationInBRL,
        IsoCodes.USD,
      );

      return {
        BRL: amountInBRL,
        ETH: this.calculusPort.divide(
          amountInBRL,
          ethQuotation.BRL,
          IsoCodes.ETH,
        ),
        USD: amountInUSD,
        KNN: this.calculusPort.divide(
          amountInUSD,
          knnQuotation.USD,
          IsoCodes.KNN,
        ),
      };
    }

    amountInUSD = this.calculusPort.divide(
      amountInBRL,
      usdQuotation.BRL,
      IsoCodes.USD,
    );

    const amountInKNN = this.calculusPort.divide(
      amountInUSD,
      knnQuotation.USD,
      IsoCodes.KNN,
    );
    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodes.ETH,
    );

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
    };
  }

  public calculateUSD(
    amountInUSD: CurrencyAmount,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): QuotationAggregate {
    let amountInBRL: CurrencyAmount;

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      const usdQuotationInBRL = this.calculusPort.divide(
        ethQuotation.BRL,
        ethQuotation.USD,
        IsoCodes.BRL,
      );

      amountInBRL = this.calculusPort.multiply(
        amountInUSD,
        usdQuotationInBRL,
        IsoCodes.BRL,
      );

      return {
        BRL: amountInBRL,
        ETH: this.calculusPort.divide(
          amountInUSD,
          ethQuotation.USD,
          IsoCodes.ETH,
        ),
        USD: amountInUSD,
        KNN: this.calculusPort.divide(
          amountInUSD,
          knnQuotation.USD,
          IsoCodes.KNN,
        ),
      };
    }

    amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodes.BRL,
    );

    const amountInKNN = this.calculusPort.divide(
      amountInUSD,
      knnQuotation.USD,
      IsoCodes.USD,
    );
    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodes.ETH,
    );

    return {
      KNN: amountInKNN,
      BRL: amountInBRL,
      USD: amountInUSD,
      ETH: amountInETH,
    };
  }

  public calculateKNN(
    amountInKNN: CurrencyAmount,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): QuotationAggregate {
    const amountInUSD = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.USD,
      IsoCodes.USD,
    );

    const amountInETH = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.ETH,
      IsoCodes.ETH,
    );

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      return {
        BRL: this.calculusPort.multiply(
          amountInETH,
          ethQuotation.BRL,
          IsoCodes.BRL,
        ),
        ETH: amountInETH,
        USD: amountInUSD,
        KNN: amountInKNN,
      };
    }

    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodes.BRL,
    );

    return {
      BRL: amountInBRL,
      ETH: amountInETH,
      USD: amountInUSD,
      KNN: amountInKNN,
    };
  }

  public calculateETH(
    amountInETH: CurrencyAmount,
    usdQuotation: UsdQuoteBasis,
    knnQuotation: KnnQuoteBasis,
    ethQuotation: EthQuoteBasis,
  ): QuotationAggregate {
    const amountInKNN = this.calculusPort.divide(
      amountInETH,
      knnQuotation.ETH,
      IsoCodes.KNN,
    );
    const amountInUSD = this.calculusPort.multiply(
      amountInKNN,
      knnQuotation.USD,
      IsoCodes.USD,
    );

    const useFallback = this.shouldUseFallback(usdQuotation, ethQuotation);

    if (useFallback) {
      return {
        BRL: this.calculusPort.multiply(
          amountInETH,
          ethQuotation.BRL,
          IsoCodes.BRL,
        ),
        ETH: amountInETH,
        USD: amountInUSD,
        KNN: amountInKNN,
      };
    }

    const amountInBRL = this.calculusPort.multiply(
      amountInUSD,
      usdQuotation.BRL,
      IsoCodes.BRL,
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
