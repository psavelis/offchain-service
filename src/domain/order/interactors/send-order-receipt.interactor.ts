
export const SendOrderReceipt = Symbol('SEND_ORDER_RECEIPT');

export interface SendOrderReceiptInteractor {
  send(id: string): Promise<void>;
}
