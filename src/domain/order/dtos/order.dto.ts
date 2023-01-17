import { OrderStatus } from '../entities/order.entity';

export interface OrderDto {
  orderId: string;
  total: number;
  status: OrderStatus;
  statusDescription: string;
}
