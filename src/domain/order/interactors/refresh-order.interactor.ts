import {type Order} from '../entities/order.entity';

export const RefreshOrder = Symbol('REFRESH_ORDER');

export type RefreshOrderInteractor = {
	refresh(order: Order): Promise<void>;
};
