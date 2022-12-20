import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import { PaymentOption } from '../entities/order.entity';

export type Email = 'EA';
export type CryptoWallet = 'CW';

export interface CreateOrderDto {
  amount: CurrencyAmount;
  paymentOption: PaymentOption;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;
}
