import { Order } from '../entities/order.entity';

export interface OrderWithPayment {
  payment: {
    id: string;
    sequence: number;
    orderId: string;
  };
  order: Order;
}
