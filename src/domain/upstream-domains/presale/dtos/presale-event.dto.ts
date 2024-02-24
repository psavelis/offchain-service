export enum PreSaleEventType {
	CLAIM = 'Claim',
	PURCHASE = 'Purchase',
}

export type PreSaleEvent = {
	name: PreSaleEventType;
	transactionHash: string;
};
