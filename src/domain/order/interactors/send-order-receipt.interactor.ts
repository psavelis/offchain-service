
export const SendOrderReceipt = Symbol('SEND_ORDER_RECEIPT');

export type SendOrderReceiptInteractor = {
	send(id: string): Promise<void>;
};
