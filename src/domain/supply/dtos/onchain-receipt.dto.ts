export type OnChainReceipt = {
	transactionHash: string;
	blockNumber: number;
	from: string;
	to: string;
	chainId: number;
	gasUsed: number;
	cumulativeGasUsed: number;
	effectiveGasPrice: number;
	maxPriorityFeePerGas: number;
	maxFeePerGas: number;
};
