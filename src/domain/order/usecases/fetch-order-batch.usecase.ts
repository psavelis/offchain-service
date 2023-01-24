import { OrderDictionary } from '../dtos/order-dictionary.dto';
import { OrderWithPayment } from '../dtos/order-with-payment.dto';
import { Order } from '../entities/order.entity';
import { FetchOrderBatchInteractor } from '../interactors/fetch-order-batch.interactor';
import { FetchableOrderPort } from '../ports/fetchable-order.port';

export class FetchOrderBatchUseCase implements FetchOrderBatchInteractor {
  constructor(readonly fetchableOrderPort: FetchableOrderPort) {}
  fetchPendingSettlement(
    limit: number = 50,
  ): Promise<Record<number, OrderWithPayment>> {
    return this.fetchableOrderPort.fetchPendingSettlement(limit);
  }

  fetchMany(endToEndIds: string[]): Promise<OrderDictionary> {
    if (!endToEndIds?.length) {
      return Promise.resolve({});
    }

    return this.fetchableOrderPort.fetchManyByEndId(endToEndIds);
  }
}
