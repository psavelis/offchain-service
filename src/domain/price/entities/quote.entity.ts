import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export interface Quote {
  id: string;
  userCurrency: string;
  userUnassignedNumber: string;
  userDecimals: number;

  userAmount: CurrencyAmount;

  createdAt: Date;
  expiresAt: Date;

  finalAmountOfTokens: CurrencyAmount;
  totalInBrl: CurrencyAmount;
  totalPerTokenInBrl: CurrencyAmount;

  gasAmountInUserCurrency: CurrencyAmount;
  netTotalInUserCurrency: CurrencyAmount;
  grossTotalInUserCurrency: CurrencyAmount;
  totalPerTokenInUserCurrency: CurrencyAmount;

  grossTotalInBrl: CurrencyAmount;
  gatewayAmountInBrl: CurrencyAmount;
  gasAmountInBrl: CurrencyAmount;
  totalFeeAmountInBrl: CurrencyAmount;

  netTotalInBrl: CurrencyAmount;
  netTotalInUsd: CurrencyAmount;
  netTotalInEth: CurrencyAmount;
  gatewayAmountInUserCurrency: CurrencyAmount;
  totalInUserCurrency: CurrencyAmount;
  totalFeeAmountInUserCurrency: CurrencyAmount;
}
