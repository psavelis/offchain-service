import {
  CurrencyAmount,
  CurrencyIsoCode,
  IsoCodes,
} from '../value-objects/currency-amount.value-object';

export interface Quote<T extends CurrencyIsoCode = CurrencyIsoCode> {
  id: string;

  userAmount: CurrencyAmount<T>;
  finalAmountOfTokens: CurrencyAmount<IsoCodes.KNN>;
  total: {
    [k in CurrencyIsoCode]: CurrencyAmount<k>;
  };
  totalPerToken: {
    [k in Exclude<CurrencyIsoCode, 'KNN'>]: CurrencyAmount<k>;
  };
  gasAmount: {
    [k in CurrencyIsoCode]: CurrencyAmount<k>;
  };
  netTotal: {
    [k in CurrencyIsoCode]: CurrencyAmount<k>;
  };

  createdAt: Date;
  expiresAt: Date;
}
