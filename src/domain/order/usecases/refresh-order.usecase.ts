import {type Order} from '../entities/order.entity';
import {type RefreshOrderInteractor} from '../interactors/refresh-order.interactor';
import {type PersistableOrderPort} from '../ports/persistable-order.port';

export class RefreshOrderUseCase implements RefreshOrderInteractor {
  constructor(readonly persistableOrderPort: PersistableOrderPort) {}
  async refresh(order: Order): Promise<void> {
    return this.persistableOrderPort.refresh(order);
  }
}
