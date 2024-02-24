import {type CurrencyAmount} from '../value-objects/currency-amount.value-object';

export type FetchableEthereumGasPricePort = {
	fetch(forceReload?: boolean): Promise<CurrencyAmount>;
};
