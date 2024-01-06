export enum PreSaleEventType {
  CLAIM = 'Claim',
  PURCHASE = 'Purchase',
}

export interface PreSaleEvent {
  name: PreSaleEventType;
  transactionHash: string;
}
