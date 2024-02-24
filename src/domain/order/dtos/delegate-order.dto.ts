import {type IsoCodeType} from '../../common/enums/iso-codes.enum';
import {type TransactionType} from '../../price/dtos/create-quote.dto';
import {
  type CurrencyAmount,
  type CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';
import {type QuotationAggregate} from '../../price/value-objects/quotation-aggregate.value-object';

export type DelegateOrderDto<T extends CurrencyIsoCode = CurrencyIsoCode> = {
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

	price: QuotationAggregate;
	gasEstimate: string;

	dueDate: string;
	incrementalNonce: string;
	nonce: string;
	signature: string;

	createdAt: Date;
	expiresAt: Date;
};
