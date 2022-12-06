import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export interface FetchableGasPricePort {
  fetch(): Promise<CurrencyAmount>;
}
