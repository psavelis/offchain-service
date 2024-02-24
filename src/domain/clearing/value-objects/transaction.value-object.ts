export class Transaction {
  constructor(
		public providerPaymentId: string, // idTransacao
		public endToEndId: string, // detalhes.txId
		public providerPaymentEndToEndId: string, // detalhes.endToEndId
		public value: string, // string c/ 2 decimals => "5.00"
		public providerTimestamp: string, // dataInclusao
		public effectiveDate: string, // dataTransacao
		public paymentOption: string, // tipoOperacao -- sempre PIX
		public operationType: string, // C - Crédito(Entrada)
  ) {}
}
