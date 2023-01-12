import { OrderDictionary } from '../dtos/order-dictionary.dto';
import { FetchOrderBatchInteractor } from '../interactors/fetch-order-batch.interactor';
import { FetchableOrderPort } from '../ports/fetchable-order.port';

export class FetchOrderBatchUseCase implements FetchOrderBatchInteractor {
  constructor(readonly fetchableOrderPort: FetchableOrderPort) {}

  fetchMany(endToEndIds: string[]): Promise<OrderDictionary> {
    if (!endToEndIds?.length) {
      return Promise.resolve({});
    }

    return this.fetchableOrderPort.fetchManyByEndId(endToEndIds);
  }
}
