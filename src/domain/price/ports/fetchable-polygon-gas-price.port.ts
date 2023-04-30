import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export interface FetchablePolygonGasPricePort {
  fetch(forceReload?: boolean): Promise<CurrencyAmount>;
}
