import { Order } from '../entities/order.entity';
import { TransitionInfo } from '../dtos/transition-info.dto';

export interface CreateOrderTransitionInteractor {
  execute(entity: Order, info: TransitionInfo): Promise<void>;
}
