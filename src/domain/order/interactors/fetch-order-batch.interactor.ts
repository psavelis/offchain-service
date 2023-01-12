import { EndToEndId, OrderDictionary } from '../dtos/order-dictionary.dto';

export const FetchOrderBatch = Symbol('FETCH_ORDER_BATCH');

export interface FetchOrderBatchInteractor {
  fetchMany(endToEndIds: EndToEndId[]): Promise<OrderDictionary>;
}
