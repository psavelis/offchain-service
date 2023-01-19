import { Order } from '../entities/order.entity';
import { TransitionInfo } from '../dtos/transition-info.dto';

export interface PersistableOrderStatusTransitionPort {
  create(order: Order, info: TransitionInfo): Promise<void>;
}
