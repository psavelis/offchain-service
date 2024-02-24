import {type IsoCodeType} from '../../common/enums/iso-codes.enum';
import {type TransactionType} from '../dtos/create-quote.dto';
import {
  type CurrencyAmount,
  type CurrencyIsoCode,
} from '../value-objects/currency-amount.value-object';

export type Quote<T extends CurrencyIsoCode = CurrencyIsoCode> = {
	id: string;
	transactionType: TransactionType;
	chainId: number;
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
};
