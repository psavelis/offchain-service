import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { OrderDto } from '../dtos/order.dto';

export const FetchOrder = Symbol('FETCH_ORDER');

export interface FetchOrderInteractor {
  fetch(id: string): Promise<BrazilianPixOrderDto | OrderDto | undefined>;
}
