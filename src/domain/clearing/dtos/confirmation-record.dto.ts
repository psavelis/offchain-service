import {type Order} from '../../order/entities/order.entity';
import {type Payment} from '../../payment/entities/payment.entity';

export type ProviderPaymentId = string;
export type ConfirmationRecord = {
	payment: Payment;
	order: Order;
};
