import { OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
import { OrderWithReceipt } from '../dtos/order-with-receipt.dto';

export interface DispatchSupplyInteractor {
  execute(order: OrderWithPayment): Promise<OrderWithReceipt>;
}
