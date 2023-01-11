import { ConfirmationRecord } from '../dtos/confirmation-record.dto';

export const ProcessStatementTransaction = Symbol(
  'PROCESS_STATEMENT_TRANSACTION',
);

export interface ProcessStatementTransactionInteractor {
  tryConfirm(): ConfirmationRecord | undefined;
}
