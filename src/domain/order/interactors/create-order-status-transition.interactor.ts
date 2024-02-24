import {type Order} from '../entities/order.entity';
import {type TransitionInfo} from '../dtos/transition-info.dto';

export type CreateOrderTransitionInteractor = {
	execute(entity: Order, info: TransitionInfo): Promise<void>;
};
