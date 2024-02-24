import {type EndToEndId} from '../dtos/order-dictionary.dto';
import {type OrderWithPayment} from '../dtos/order-with-payment.dto';
import {type Order, type OrderStatus} from '../entities/order.entity';

export type FetchableOrderPort = {
	fetchByEndId(endToEndId: EndToEndId): Promise<Order | undefined>;

	fetchManyByEndId(
		endToEndIds: EndToEndId[],
	): Promise<Record<EndToEndId, Order>>;

	fetchPendingSettlement(
		limit: number,
	): Promise<Record<number, OrderWithPayment>>;

	fetchLockedAndNotClaimedInStatus(
		...orderStatus: OrderStatus[]
	): Promise<Record<string, Order>>;

	fetchManyByStatus(
		orderStatus: OrderStatus[],
		limit: number,
	): Promise<Record<EndToEndId, Order>>;
};
