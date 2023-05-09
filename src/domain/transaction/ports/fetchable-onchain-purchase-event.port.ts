import { Purchase } from '../entities/purchase.entity';

export interface FetchableOnChainPurchaseEventPort {
  fetchByBlockNumber(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ): Promise<Purchase[]>;
}
