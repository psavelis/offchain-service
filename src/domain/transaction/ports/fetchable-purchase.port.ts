import { Purchase } from '../entities/purchase.entity';

export interface FetchablePurchasePort {
  fetchByTransactionHash(transactionHash: string): Promise<Purchase>;
  fetchLastBlocks(): Promise<{
    ethereumLastBock: number;
    polygonLastBlock: number;
  }>;
}
