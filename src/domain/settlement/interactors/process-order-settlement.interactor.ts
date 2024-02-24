import {type OrderWithPayment} from '../../order/dtos/order-with-payment.dto';
export type ProcessOrderSettlementInteractor = {
	execute(order: OrderWithPayment): Promise<void>;
};
