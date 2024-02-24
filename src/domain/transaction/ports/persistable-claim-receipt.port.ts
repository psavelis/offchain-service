import {type Order} from '../../order/entities/order.entity';
import {type OnChainUserReceipt} from '../../supply/dtos/onchain-user-receipt.dto';

export type PersistableClaimReceiptPort = {
	create(order: Order, userReceipt: OnChainUserReceipt): Promise<void>;
};
