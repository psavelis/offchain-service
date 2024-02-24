import {type Clearing} from '../entities/clearing.entity';
import {type Statement} from '../value-objects/statement.value-object';

export type StatementParameter = {
	target: string;
	offset: string;
};

export type FetchableStatementPort = {
	fetch({target, offset}: StatementParameter): Promise<Statement>;
	fetchNext(current: Statement): Promise<Statement>;
	getStatementParameter(last: Clearing | undefined): StatementParameter;
	getToken(): Promise<string>;
};
