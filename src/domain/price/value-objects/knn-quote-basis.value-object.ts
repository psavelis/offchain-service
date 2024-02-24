import {type CurrencyAmount} from './currency-amount.value-object';

export type KnnQuoteBasis = {
	USD: CurrencyAmount;
	ETH: CurrencyAmount;
	expiration: Date;
};
