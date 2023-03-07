import { Order } from '../entities/order.entity';
import { RefreshOrderInteractor } from '../interactors/refresh-order.interactor';
import { PersistableOrderPort } from '../ports/persistable-order.port';

export class RefreshOrderUseCase implements RefreshOrderInteractor {
  constructor(readonly persistableOrderPort: PersistableOrderPort) {}
  refresh(order: Order): Promise<void> {
    return this.persistableOrderPort.refresh(order);
  }
}
