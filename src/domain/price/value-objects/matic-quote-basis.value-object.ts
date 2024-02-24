import {type CurrencyAmount} from './currency-amount.value-object';

export type MaticQuoteBasis = {
	USD: CurrencyAmount;
	ETH: CurrencyAmount;
	expiration: Date;
};
