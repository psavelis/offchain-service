import { Order } from '../../order/entities/order.entity';
import { OnChainUserReceipt } from './onchain-user-receipt.dto';

export interface OnchainDelegateClaimEvent {
  userReceipt: OnChainUserReceipt;
  order: Order;
}
