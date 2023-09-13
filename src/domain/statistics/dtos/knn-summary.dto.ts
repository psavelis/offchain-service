export interface KnnSummaryDto {
  totalSupply: number;
  circulatingSupply: number;
  stockOption: number;
  holders: {
    totalTransfers: number;
    count: number;
    totalAmount: number;
  };
}
