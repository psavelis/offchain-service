import { Order } from '../entities/order.entity';
import { TransitionInfo } from '../interactors/create-order-status-transition.interactor';

export interface PersistableOrderStatusTransitionPort {
  create(order: Order, info: TransitionInfo): Promise<void>;
}
