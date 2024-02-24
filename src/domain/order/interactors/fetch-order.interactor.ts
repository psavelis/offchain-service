import {type BrazilianPixOrderDto} from '../dtos/brazilian-pix-order.dto';
import {type OrderDto} from '../dtos/order.dto';

export const FetchOrder = Symbol('FETCH_ORDER');

export type FetchOrderInteractor = {
	fetch(id: string): Promise<BrazilianPixOrderDto | OrderDto | undefined>;
};
