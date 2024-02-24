import {type Purchase} from '../entities/purchase.entity';

export type FetchablePurchasePort = {
	fetchByTransactionHash(
		transactionHash: string,
	): Promise<Purchase | undefined>;
	fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}>;
};
