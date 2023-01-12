import { Payment } from '../entities/payment.entity';

export interface PersistablePaymentPort {
  create(entity: Payment): Promise<Payment>;
}
