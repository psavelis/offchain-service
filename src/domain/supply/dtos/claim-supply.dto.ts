import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export interface ClaimSupplyDto {
  nonce: number;
  onchainAddress: string;
  amount: CurrencyAmount<CurrencyIsoCode>;
}
