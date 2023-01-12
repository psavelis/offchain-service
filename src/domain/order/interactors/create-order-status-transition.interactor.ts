import { Order } from '../entities/order.entity';

export interface TransitionInfo {
  reason: string;
}

export interface CreateOrderTransitionInteractor {
  execute(entity: Order, info: TransitionInfo): Promise<void>;
}
