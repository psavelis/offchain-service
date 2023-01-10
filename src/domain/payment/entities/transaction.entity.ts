export enum TransactionState {
  CREATED = 1,
  LOCKED = 2,
  CANCELED = 3,
  AWAITING_SETTLEMENT = 4,
  COMPLETED = 5,
  REJECTED = 6,
  EXPIRED = 7,
}

export class Transaction {
  id: string;
  state: TransactionState;
  userId?: string;
  quoteId?: string;
  userReferenceId: string;
  gatewayReferenceId?: string;
  chainReferenceId: number;
  gasFeeAmount: number;
  gatewayFeeAmount: number;
  totalAmount: number;
  walletAddress?: string;
  amountOfTokens: number;
  lockedAmount: number;
  created_at: Date;
  expires_at?: Date;
}
