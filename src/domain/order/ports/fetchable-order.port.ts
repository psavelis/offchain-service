import { EndToEndId } from '../dtos/order-dictionary.dto';
import { OrderWithPayment } from '../dtos/order-with-payment.dto';
import { Order } from '../entities/order.entity';

export interface FetchableOrderPort {
  fetchByEndId(endToEndId: EndToEndId): Promise<Order | undefined>;

  fetchManyByEndId(
    endToEndIds: EndToEndId[],
  ): Promise<Record<EndToEndId, Order>>;

  fetchPendingSettlement(
    limit: number,
  ): Promise<Record<number, OrderWithPayment>>;
}
