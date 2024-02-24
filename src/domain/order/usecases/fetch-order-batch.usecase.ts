import { type OrderDictionary } from '../dtos/order-dictionary.dto';
import { type OrderWithPayment } from '../dtos/order-with-payment.dto';
import { type FetchOrderBatchInteractor } from '../interactors/fetch-order-batch.interactor';
import { type FetchableOrderPort } from '../ports/fetchable-order.port';

export class FetchOrderBatchUseCase implements FetchOrderBatchInteractor {
  constructor(readonly fetchableOrderPort: FetchableOrderPort) {}
  async fetchPendingSettlement(
    limit = 50,
  ): Promise<Record<number, OrderWithPayment>> {
    return this.fetchableOrderPort.fetchPendingSettlement(limit);
  }

  async fetchMany(endToEndIds: string[]): Promise<OrderDictionary> {
    if (!endToEndIds?.length) {
      return Promise.resolve({});
    }

    return this.fetchableOrderPort.fetchManyByEndId(endToEndIds);
  }
}
