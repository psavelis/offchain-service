import { Order } from '../../order/entities/order.entity';
import { OnChainReceipt } from './onchain-receipt.dto';

export interface OrderWithReceipt {
  order: Order;
  receipt: OnChainReceipt;
}
