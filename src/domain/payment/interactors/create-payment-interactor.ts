import {type Payment} from '../entities/payment.entity';

export type CreatePaymentInteractor = {
	execute(entity: Payment): Promise<Payment>;
};
