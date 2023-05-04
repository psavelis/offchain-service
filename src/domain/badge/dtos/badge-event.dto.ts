export enum BadgeEventType {
  MINT = 'Mint',
}

export interface BadgeEvent {
  name: BadgeEventType;
  transactionHash: string;
  referenceMetadataId: number;
}
