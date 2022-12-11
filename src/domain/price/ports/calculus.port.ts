import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export interface CalculusPort {
  sum(a: CurrencyAmount, b: CurrencyAmount): CurrencyAmount;
  divide(
    dividend: CurrencyAmount,
    divisor: CurrencyAmount,
    outCurrency: CurrencyIsoCode,
  ): CurrencyAmount;
  multiply(
    multiplicand: CurrencyAmount,
    multiplier: CurrencyAmount,
    outCurrency: CurrencyIsoCode,
  ): CurrencyAmount;

  isPositive(amount: CurrencyAmount): boolean;
  isNegative(amount: CurrencyAmount): boolean;
}
