export const ExpireOrders = Symbol('EXPIRE_ORDERS');

export type ExpireOrdersInteractor = {
	execute(): Promise<void>;
};
