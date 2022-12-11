import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export interface CreateQuoteDto {
  quoteId?: string;
  amount: CurrencyAmount;
  forceReload?: boolean;
}
