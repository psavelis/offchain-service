import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';
import { CryptoWallet, Email, PaymentOption } from '../entities/order.entity';

export interface CreateOrderDto {
  amount: CurrencyAmount<CurrencyIsoCode>;
  paymentOption: PaymentOption;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;
  clientAgent?: string;
  clientIp?: string;
}
