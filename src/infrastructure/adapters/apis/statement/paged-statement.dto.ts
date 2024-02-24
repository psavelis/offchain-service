export type PagedStatementDto = {
	totalPaginas: number;
	totalElementos: number;
	ultimaPagina: boolean;
	primeiraPagina: boolean;
	tamanhoPagina: number;
	numeroDeElementos: number;
	transacoes: StatementTransaction[];
};

export type StatementTransaction = {
	idTransacao: string;
	dataInclusao: string;
	dataTransacao: string;
	tipoTransacao: string;
	tipoOperacao: string;
	valor: string;
	titulo: string;
	descricao: string;
	detalhes: TransactionDetail;
};

export type TransactionDetail = {
	txId: string;
	nomePagador: string;
	descricaoPix: string;
	cpfCnpjPagador: string;
	nomeEmpresaPagador: string;
	tipoDetalhe: string;
	endToEndId: string;
	chavePixRecebedor: string;
};

// { <name>: <type> | <example_of_value> }
// export interface PagedStatementDtoWithExample {
//   totalPaginas: number | 1;
//   totalElementos: number | 1;
//   ultimaPagina: boolean | true;
//   primeiraPagina: boolean | true;
//   tamanhoPagina: number | 50;
//   numeroDeElementos: number | 1;
//   transacoes: StatementTransactionWithExample[];
// }

// export interface StatementTransactionWithExample {
//   idTransacao: string | 'XXAxXzAwFAD5XzI3NTkzfjFxXzIwMjItMTEtMjFfOTAwMDAwNTYD';
//   dataInclusao: string | '2023-01-01 16:20:01.710';
//   dataTransacao: string | '2023-01-01';
//   tipoTransacao: string | 'PIX';
//   tipoOperacao: string | 'C';
//   valor: string | '7.10';
//   titulo: string | 'Pix recebido';
//   descricao: string | 'John Doe';
//   detalhes: TransactionDetailWithExample;
// }

// export interface TransactionDetailWithExample {
//   txId: string | 'PocKanna6';
//   nomePagador: string | 'John Doe';
//   descricaoPix: string | '';
//   cpfCnpjPagador: string | '9999999999';
//   nomeEmpresaPagador: string | 'JDOE';
//   tipoDetalhe: string | 'COMPLETE';
//   endToEndId: string | 'F90400989820221121185207340337811';
//   chavePixRecebedor: string | '99999999999999';
// }
