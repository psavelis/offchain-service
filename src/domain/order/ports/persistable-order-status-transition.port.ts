import {type Order} from '../entities/order.entity';
import {type TransitionInfo} from '../dtos/transition-info.dto';

export type PersistableOrderStatusTransitionPort = {
	create(order: Order, info: TransitionInfo): Promise<void>;
};
