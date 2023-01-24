import { OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
export interface ProcessOrderSettlementInteractor {
  execute(order: OrderWithPayment): Promise<void>;
}
