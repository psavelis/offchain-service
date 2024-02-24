import {type CurrencyAmount} from './currency-amount.value-object';

export type EthQuoteBasis = {
	BRL?: CurrencyAmount;
	USD: CurrencyAmount;
	expiration: Date;
};
