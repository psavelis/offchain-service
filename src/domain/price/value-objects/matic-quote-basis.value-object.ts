import { CurrencyAmount } from './currency-amount.value-object';

export interface MaticQuoteBasis {
  USD: CurrencyAmount;
  ETH: CurrencyAmount;
  expiration: Date;
}
