import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export interface FetchableEthereumGasPricePort {
  fetch(forceReload?: boolean): Promise<CurrencyAmount>;
}
