export const ExpireOrders = Symbol('EXPIRE_ORDERS');

export interface ExpireOrdersInteractor {
  execute(): Promise<void>;
}
