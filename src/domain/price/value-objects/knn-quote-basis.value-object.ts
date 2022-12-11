import { CurrencyAmount } from './currency-amount.value-object';

export interface KnnQuoteBasis {
  USD: CurrencyAmount;
  ETH: CurrencyAmount;
  expiration: Date;
}
