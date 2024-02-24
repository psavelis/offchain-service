import {type CurrencyAmount} from '../value-objects/currency-amount.value-object';

export type TransactionType = 'Transfer' | 'Claim' | 'LockSupply';

export type CreateQuoteDto = {
	quoteId?: string;
	amount: CurrencyAmount;
	transactionType?: TransactionType;
	forceReload?: boolean;
	chainId: number;
};
