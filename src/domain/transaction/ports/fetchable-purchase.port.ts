import { Purchase } from '../entities/purchase.entity';

export interface FetchablePurchasePort {
  fetchByTransactionHash(
    transactionHash: string,
  ): Promise<Purchase | undefined>;
  fetchLastBlocks(): Promise<{
    ethereumLastBlock: number;
    polygonLastBlock: number;
  }>;
}
