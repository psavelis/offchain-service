import {type Order} from '../entities/order.entity';

export type PersistableOrderPort = {
	refresh(order: Order): Promise<void>;
	create(order: Order): Promise<Order>;
};
