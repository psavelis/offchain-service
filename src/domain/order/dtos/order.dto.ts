import { OrderStatus, UserIdentifier } from '../entities/order.entity';

export interface OrderDto {
  orderId: string;
  total: number;
  status: OrderStatus;
  statusDescription: string;
  expired: boolean;
  expiration: Date;
  identifierType: UserIdentifier;
  lockTransactionHash: string;
  claimTransactionHash: string;
}
