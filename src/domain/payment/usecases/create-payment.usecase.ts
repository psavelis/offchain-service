import { Payment } from '../entities/payment.entity';
import { CreatePaymentInteractor } from '../interactors/create-payment-interactor';
import { PersistablePaymentPort } from '../ports/persistable-payment.port';

export class CreatePaymentUseCase implements CreatePaymentInteractor {
  constructor(readonly persistablePaymentPort: PersistablePaymentPort) {}

  execute(entity: Payment): Promise<Payment> {
    return this.persistablePaymentPort.create(entity);
  }
}
