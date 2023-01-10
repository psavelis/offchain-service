import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import { CryptoWallet, Email, PaymentOption } from '../entities/order.entity';

export interface CreateOrderDto {
  amount: CurrencyAmount;
  paymentOption: PaymentOption;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;
}
