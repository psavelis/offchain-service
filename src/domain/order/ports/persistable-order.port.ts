import { Order } from '../entities/order.entity';

export interface PersistableOrderPort {
  create(order: Order): Promise<Order>;
}
