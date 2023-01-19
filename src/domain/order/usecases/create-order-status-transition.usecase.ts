import { Order } from '../entities/order.entity';
import { PersistableOrderStatusTransitionPort } from '../ports/persistable-order-status-transition.port';
import { CreateOrderTransitionInteractor } from '../interactors/create-order-status-transition.interactor';
import { TransitionInfo } from '../dtos/transition-info.dto';

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
