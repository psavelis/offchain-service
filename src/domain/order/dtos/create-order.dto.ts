import { NetworkType } from 'src/domain/common/enums/network-type.enum';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';
import { UserIdentifier, PaymentOption } from '../entities/order.entity';

export interface CreateOrderDto {
  amount: CurrencyAmount<CurrencyIsoCode>;
  paymentOption: PaymentOption;
  userIdentifier: string;
  identifierType: UserIdentifier;
  chainId: NetworkType;
  clientAgent?: string;
  clientIp?: string;
}
