import { OrderStatus } from '../entities/order.entity';

export interface OrderDto {
  orderId: string;
  total: number;
  status: OrderStatus;
  statusDescription: string;
  expired: boolean;
  expiration: Date;
  lockTransactionHash: string;
  claimTransactionHash: string;
}
