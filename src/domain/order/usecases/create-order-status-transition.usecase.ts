import { Order } from '../entities/order.entity';
import {
  CreateOrderTransitionInteractor,
  TransitionInfo,
} from '../interactors/create-order-status-transition.interactor';

export class CreateOrderStatusTransitionUseCase
  implements CreateOrderTransitionInteractor
{
  execute(entity: Order, info: TransitionInfo): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
