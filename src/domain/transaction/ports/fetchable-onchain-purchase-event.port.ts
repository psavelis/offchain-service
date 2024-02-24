import {type Purchase} from '../entities/purchase.entity';

export type FetchableOnChainPurchaseEventPort = {
	fetchByBlockNumber(
		fromEthereumBlock: number,
		fromPolygonBlock: number,
	): Promise<Purchase[]>;
};
