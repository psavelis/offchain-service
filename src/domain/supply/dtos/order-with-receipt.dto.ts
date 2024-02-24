import {type Order} from '../../order/entities/order.entity';
import {type OnChainReceipt} from './onchain-receipt.dto';

export type OrderWithReceipt = {
	order: Order;
	receipt: OnChainReceipt;
};
