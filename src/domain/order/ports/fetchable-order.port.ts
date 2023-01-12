import { EndToEndId } from '../dtos/order-dictionary.dto';
import { Order } from '../entities/order.entity';

export interface FetchableOrderPort {
  fetchByEndId(endToEndId: EndToEndId): Promise<Order | undefined>;

  fetchManyByEndId(
    endToEndIds: EndToEndId[],
  ): Promise<Record<EndToEndId, Order>>;
}
