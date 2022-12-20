import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';

export interface BrazilianPixOrderDto {
  orderId: string;
  total: number;
  payload: string;
  base64: string;
}
