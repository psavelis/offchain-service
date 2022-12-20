import { Order } from '../entities/order.entity';

export interface PersistableOrderPort {
  save(order: Order): Promise<Order>;
}
