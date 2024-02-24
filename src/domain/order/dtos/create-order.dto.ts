import { type NetworkType } from '../../common/enums/network-type.enum';
import { type CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import {
  type PaymentOption,
  type UserIdentifier,
} from '../entities/order.entity';

export type CreateOrderDto = {
  amount: CurrencyAmount;
  paymentOption: PaymentOption;
  userIdentifier: string;
  identifierType: UserIdentifier;
  chainId: NetworkType;
  clientAgent?: string;
  clientIp?: string;
};
