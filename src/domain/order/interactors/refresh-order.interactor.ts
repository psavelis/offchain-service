import { Order } from '../entities/order.entity';

export const RefreshOrder = Symbol('REFRESH_ORDER');

export interface RefreshOrderInteractor {
  refresh(order: Order): Promise<void>;
}
