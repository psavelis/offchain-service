import { IsoCodes } from '../../price/value-objects/currency-amount.value-object';
import { CryptoWallet, Email } from '../dtos/create-order.dto';

export enum PaymentOption {
  BrazilianPix = 1,
}

export interface Order {
  id?: string;
  paymentOption: PaymentOption;
  isoCode: IsoCodes;
  endToEndId: string;
  total: number;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;

  // TODO: revisar campos necessarios
  // isoCode: IsoCodes;
  // amountOfTokens: number;
  // totalPerToken: number;
  // netTotal: number;
  // gasAmount: number;
  // grossTotal: number;
  // gatewayAmount: number;
}
