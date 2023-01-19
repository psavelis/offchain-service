import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export interface LockSupplyDto {
  nonce: number;
  amount: CurrencyAmount<CurrencyIsoCode>;
}
