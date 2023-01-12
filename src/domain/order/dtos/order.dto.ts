export interface OrderDto {
  orderId: string;
  total: number;
  status: string;
  // TODO: adicionar numero de reserva/numero fiscal (gerado pos pagamento)
}
