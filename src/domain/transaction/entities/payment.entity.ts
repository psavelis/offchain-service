export enum PaymentOption {
  FASTER_PAYMENT_PROVIDER = 1,
  CARD_PROVIDER = 2,
  RPC_PROVIDER = 3,
}

export enum PaymentDirection {
  CREDIT = 1,
  DEBIT = 2,
}

export type PaymentCurrency = 'KNN' | 'BRL' | 'USD' | 'ETH';

export class Payment {
  id: string;
  transactionId?: string;
  option: PaymentOption;
  cryptoAmount: string;
  fiatAmount: number;
  direction: PaymentDirection;
  currency: PaymentCurrency;
  details: string;
}
