import { Order } from '../../order/entities/order.entity';
import { Payment } from '../../payment/entities/payment.entity';

export type ProviderPaymentId = string;
export interface ConfirmationRecord {
  payment: Payment;
  order: Order;
}
