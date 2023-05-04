import { CurrencyAmount } from './currency-amount.value-object';

export interface EthQuoteBasis {
  BRL?: CurrencyAmount;
  USD: CurrencyAmount;
  expiration: Date;
}
