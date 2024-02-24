import {type Order} from '../../order/entities/order.entity';
import {type OnChainUserReceipt} from './onchain-user-receipt.dto';

export type OnchainDelegateClaimEvent = {
	userReceipt: OnChainUserReceipt;
	order: Order;
};
