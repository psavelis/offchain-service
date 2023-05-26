export interface LockedOrdersSummaryDto {
  lockedTokens: {
    totalAmount: number;
    preSale: number;
    sale: number;
  };
}
