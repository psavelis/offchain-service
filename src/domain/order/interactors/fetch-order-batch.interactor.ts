import { EndToEndId, OrderDictionary } from '../dtos/order-dictionary.dto';
import { OrderWithPayment } from '../dtos/order-with-payment.dto';

export const FetchOrderBatch = Symbol('FETCH_ORDER_BATCH');

export interface FetchOrderBatchInteractor {
  fetchMany(endToEndIds: EndToEndId[]): Promise<OrderDictionary>;
  fetchPendingSettlement(
    limit: number,
  ): Promise<Record<number, OrderWithPayment>>;
}
