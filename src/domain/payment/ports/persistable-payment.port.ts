import {type Payment} from '../entities/payment.entity';

export type PersistablePaymentPort = {
	create(entity: Payment): Promise<Payment>;
};
