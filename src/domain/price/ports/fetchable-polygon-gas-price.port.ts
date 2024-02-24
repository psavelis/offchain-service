import { type CurrencyAmount } from '../value-objects/currency-amount.value-object';

export type FetchablePolygonGasPricePort = {
  fetch(forceReload?: boolean): Promise<CurrencyAmount>;
};
