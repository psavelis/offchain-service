import {type Payment} from '../entities/payment.entity';
import {type CreatePaymentInteractor} from '../interactors/create-payment-interactor';
import {type PersistablePaymentPort} from '../ports/persistable-payment.port';

export class CreatePaymentUseCase implements CreatePaymentInteractor {
  constructor(readonly persistablePaymentPort: PersistablePaymentPort) {}

  async execute(entity: Payment): Promise<Payment> {
    return this.persistablePaymentPort.create(entity);
  }
}
