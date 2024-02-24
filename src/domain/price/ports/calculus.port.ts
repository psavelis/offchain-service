import {
  type CurrencyAmount,
  type CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export type CalculusPort = {
	sum<T extends CurrencyIsoCode = CurrencyIsoCode>(
		a: CurrencyAmount<T>,
		b: CurrencyAmount<T>,
	): CurrencyAmount<T>;
	sub<T extends CurrencyIsoCode = CurrencyIsoCode>(
		a: CurrencyAmount<T>,
		b: CurrencyAmount<T>,
	): CurrencyAmount<T>;
	divide<
		C extends CurrencyIsoCode,
		T extends CurrencyIsoCode = CurrencyIsoCode,
		U extends CurrencyIsoCode = T,
	>(
		dividend: CurrencyAmount<T>,
		divisor: CurrencyAmount<U>,
		outCurrency: C,
	): CurrencyAmount<C>;
	multiply<
		C extends CurrencyIsoCode,
		T extends CurrencyIsoCode = CurrencyIsoCode,
		U extends CurrencyIsoCode = T,
	>(
		multiplicand: CurrencyAmount<T>,
		multiplier: CurrencyAmount<U>,
		outCurrency: C,
	): CurrencyAmount<C>;

	isPositive(amount: CurrencyAmount): boolean;
	isNegative(amount: CurrencyAmount): boolean;
};
