import {
  type CurrencyAmount,
  type CurrencyIsoCode,
} from './currency-amount.value-object';

export type QuotationAggregate = {
	[k in CurrencyIsoCode]: CurrencyAmount<k>;
};
