import { Order } from '../../order/entities/order.entity';
import { OnChainReceipt } from './onchain-receipt.dto';
import { OnChainUserReceipt } from './onchain-user-receipt.dto';

export interface OnchainDelegateClaimEvent {
  userReceipt: OnChainUserReceipt;
  order: Order;
  // TODO: payment será manipulado pelo domínio de transaction
}
