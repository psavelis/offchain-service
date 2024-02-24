import {type Order} from '../entities/order.entity';

export type OrderWithPayment = {
	payment: {
		id: string;
		sequence: number;
		orderId: string;
	};
	order: Order;
};
