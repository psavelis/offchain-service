import {type EndToEndId, type OrderDictionary} from '../dtos/order-dictionary.dto';
import {type OrderWithPayment} from '../dtos/order-with-payment.dto';

export const FetchOrderBatch = Symbol('FETCH_ORDER_BATCH');

export type FetchOrderBatchInteractor = {
	fetchMany(endToEndIds: EndToEndId[]): Promise<OrderDictionary>;
	fetchPendingSettlement(
		limit: number,
	): Promise<Record<number, OrderWithPayment>>;
};
