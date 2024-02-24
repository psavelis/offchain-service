import {type Transaction} from './transaction.value-object';

export class Statement {
  constructor(
		public currentPage: number,
		public totalPages: number,
		public totalStatementEntries: number,
		public lastPage: boolean,
		public pageSize: number,
		public totalPageEntries: number,
		public target: string,
		public offset: string,
		public transactions: Transaction[],
  ) {}

  getHash(): string {
    return `${this.totalPages}|${this.totalStatementEntries}|${this.target}|${this.offset}`;
  }
}
