import { Order } from '../entities/order.entity';

export interface FetchableOrderPort {
  fetchByEndId(endToEndId: string): Promise<Order>;
}
