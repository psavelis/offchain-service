import { Clearing } from '../entities/clearing.entity';
import { Statement } from '../value-objects/statement.value-object';

export interface StatementParameter {
  target: string;
  offset: string;
}

export interface FetchableStatementPort {
  fetch({ target, offset }: StatementParameter): Promise<Statement>;
  fetchNext(current: Statement): Promise<Statement>;
  getStatementParameter(last: Clearing | undefined): StatementParameter;
}
