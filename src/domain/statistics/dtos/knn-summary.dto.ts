export interface KnnSummaryDto {
  totalSupply: number;
  circulatingSupply: number;
  holders: {
    totalTransfers: number;
    count: number;
    totalAmount: number;
  };
}
