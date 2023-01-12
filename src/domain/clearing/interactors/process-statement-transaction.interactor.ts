import { Order } from '../../order/entities/order.entity';
import { ConfirmationRecord } from '../dtos/confirmation-record.dto';
import { Clearing } from '../entities/clearing.entity';
import { Transaction } from '../value-objects/transaction.value-object';

export const ProcessStatementTransaction = Symbol(
  'PROCESS_STATEMENT_TRANSACTION',
);

export interface ProcessStatementTransactionInteractor {
  execute(
    order: Order,
    transaction: Transaction,
    clearing: Clearing,
  ): Promise<ConfirmationRecord | undefined>;
}
