import {type Order} from '../entities/order.entity';
import {type PersistableOrderStatusTransitionPort} from '../ports/persistable-order-status-transition.port';
import {type CreateOrderTransitionInteractor} from '../interactors/create-order-status-transition.interactor';
import {type TransitionInfo} from '../dtos/transition-info.dto';

export class CreateOrderStatusTransitionUseCase
implements CreateOrderTransitionInteractor {
  constructor(
		readonly persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort,
  ) {}

  async execute(order: Order, info: TransitionInfo): Promise<void> {
    return this.persistableOrderStatusTransitionPort.create(order, info);
  }
}
