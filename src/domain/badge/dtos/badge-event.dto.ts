export enum BadgeEventType {
	MINT = 'Mint',
}

export type BadgeEvent = {
	name: BadgeEventType;
	transactionHash: string;
	referenceMetadataId: number;
};
