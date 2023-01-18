import { Order } from '../entities/order.entity';
import { PersistableOrderStatusTransitionPort } from '../ports/persistable-order-status-transition.port';
import {
  CreateOrderTransitionInteractor,
  TransitionInfo,
} from '../interactors/create-order-status-transition.interactor';

export class CreateOrderStatusTransitionUseCase
  implements CreateOrderTransitionInteractor
{
  constructor(
    readonly persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort,
  ) {}

  execute(order: Order, info: TransitionInfo): Promise<void> {
    return this.persistableOrderStatusTransitionPort.create(order, info);
  }
}
