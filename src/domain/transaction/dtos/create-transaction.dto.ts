export interface CreateTransactionDto {
  quoteId: string;
  email: string;
  name: string;
  phone: string;
  walletAddress?: string;
}
