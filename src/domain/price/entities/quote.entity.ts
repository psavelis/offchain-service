import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { TransactionType } from '../dtos/create-quote.dto';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../value-objects/currency-amount.value-object';

export interface Quote<T extends CurrencyIsoCode = CurrencyIsoCode> {
  id: string;
  transactionType: TransactionType;
  userAmount: CurrencyAmount<T>;
  finalAmountOfTokens: CurrencyAmount<IsoCodeType.KNN>;
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
