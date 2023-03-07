import { Order } from '../entities/order.entity';

export interface PersistableOrderPort {
  refresh(order: Order): Promise<void>;
  create(order: Order): Promise<Order>;
}
