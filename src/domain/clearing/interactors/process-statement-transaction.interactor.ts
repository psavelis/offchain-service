import {type Order} from '../../order/entities/order.entity';
import {type ConfirmationRecord} from '../dtos/confirmation-record.dto';
import {type Clearing} from '../entities/clearing.entity';
import {type Transaction} from '../value-objects/transaction.value-object';

export const ProcessStatementTransaction = Symbol(
  'PROCESS_STATEMENT_TRANSACTION',
);

export type ProcessStatementTransactionInteractor = {
	execute(
		order: Order,
		transaction: Transaction,
		clearing: Clearing,
	): Promise<ConfirmationRecord | undefined>;
};
