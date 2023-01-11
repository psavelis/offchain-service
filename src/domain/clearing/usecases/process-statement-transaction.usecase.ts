import { Order } from '../../order/entities/order.entity';
import { ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';

export class ProcessStatementTransactionUseCase
  implements ProcessStatementTransactionInteractor
{
  constructor(
    readonly createPaymentInteractor: CreatePaymentInteractor,
    readonly orderTransitionInteractor: OrderTransitionInteractor,
    readonly dispatchSupplyInteractor: DispatchSupplyInteractor,
  ) {}

  tryConfirm(order: Order, payment) {
    try {
      const amountNotExact = order.getTotal().toFixed(2) !== payment.total;

      if (amountNotExact) {
        // todo: opt 1) notificar incorreto e retornar undefined para ignorar
        return undefined;

        // todo: opt 2) create new order, add parent_id () // o recalculo possibilita maior flexibilidade (recreate-quote-usecase*)
      }

      let boundedOrder = order;
      if (order.hasPayments()) {
        return undefined; // check if payments already exists (by unique id), create new order, add parent_id (recreate-quote-usecase*)
      }

      if (order.isExpired()) {
        // create new order, add parent_id (recreate-quote-usecase*)
      }

      // --- usecase de validação de supply e destino --> estimate-dispatch-supply.interactor
      // TODO: (verificar se existe supply disponível -- ja serve como healthcheck do provider), se estiver fora, atualizar a clearing como failing e finalizar // se não possuir estoque, atualizar como outofstock
      //        se supply insuficiente, notificar
      // TODO: validar se possui saldo suficiente em ETH, notificar
      // TODO: validar se endereço existe é uma carteira valida ou smart contract
      // TODO: fazer get de payment pelo order (para ver se é dup -- opcional)
      // --- usecase de validação de supply e destino

      // TODO: insert payment // CreatePaymentInteractor
      // TODO: update order status // orderTransitionInteractor
      // TODO: update claim lock // dispatchSupply => //
      // TODO: update order status // orderTransitionInteractor

      // TODO: se for email, notificar o lock e instruções para o claim
    } catch (err) {
      // TODO:  log!!!
      // catch CreatePaymentInteractor (concurrency ou duplicated payment)
      // catch CreatePaymentInteractor (concurrency ou duplicated payment)
      return undefined;
    }

    throw new Error('Method not implemented.');
  }
}
