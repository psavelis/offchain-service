import {type OrderWithPayment} from '../../order/dtos/order-with-payment.dto';
import {type OrderWithReceipt} from '../dtos/order-with-receipt.dto';

export type DispatchSupplyInteractor = {
	execute(order: OrderWithPayment): Promise<OrderWithReceipt>;
};
