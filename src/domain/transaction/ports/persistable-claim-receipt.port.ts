import { Order } from '../../order/entities/order.entity';
import { OnChainUserReceipt } from '../../supply/dtos/onchain-user-receipt.dto';

export interface PersistableClaimReceiptPort {
  create(order: Order, userReceipt: OnChainUserReceipt): Promise<void>;
}
