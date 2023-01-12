import { Payment } from '../entities/payment.entity';

export interface CreatePaymentInteractor {
  execute(entity: Payment): Promise<Payment>;
}
