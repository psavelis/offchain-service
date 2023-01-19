export class QuoteResponseDto {
  quoteId: string;
  usdPrice: number;
  knnPriceInUsd: number;
  gasBaseFee: number;

  currency: string;
  amount: number;

  totalFee: number;
  totalAmountCurrency: number;
  totalAmountToken: number;

  created_at: Date;
  expires_at: Date;
}
