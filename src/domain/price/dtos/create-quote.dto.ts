import { CurrencyAmount } from '../value-objects/currency-amount.value-object';

export type TransactionType = 'Transfer' | 'Claim' | 'LockSupply';

export interface CreateQuoteDto {
  quoteId?: string;
  amount: CurrencyAmount;
  transactionType?: TransactionType;
  forceReload?: boolean;
}
