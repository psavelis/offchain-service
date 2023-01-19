import { LoggablePort } from '../../common/ports/loggable.port';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { Payment } from '../../payment/entities/payment.entity';
import { CreatePaymentInteractor } from '../../payment/interactors/create-payment-interactor';
import { ConfirmationRecord } from '../dtos/confirmation-record.dto';
import { Clearing } from '../entities/clearing.entity';
import { ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';
import { Transaction } from '../value-objects/transaction.value-object';

const findableKeyword = '#payment-process';
export class ProcessStatementTransactionUseCase
  implements ProcessStatementTransactionInteractor
{
  // TODO: adicionar readonly createOrderInteractor: CreateOrderInteractor // para o recalculo
  constructor(
    readonly logger: LoggablePort,
    readonly createPaymentInteractor: CreatePaymentInteractor,
    readonly orderTransitionInteractor: CreateOrderTransitionInteractor,
  ) {}

  async execute(
    order: Order,
    transaction: Transaction,
    clearing: Clearing,
  ): Promise<ConfirmationRecord | undefined> {
    let matchingOrder = order;

    try {
      const {
        providerPaymentId,
        providerPaymentEndToEndId,
        providerTimestamp,
        effectiveDate,
        value: amountPaid,
      } = transaction;
      const expectedAmount = matchingOrder.getTotal().toFixed(2);

      const amountNotExact = expectedAmount !== amountPaid;

      if (amountNotExact) {
        this.logger.warning(
          `${findableKeyword} incorrect amount: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} expects '${expectedAmount}' (order.total: ${matchingOrder.getTotal()}) but received '${amountPaid}'`,
          {
            order,
            transaction,
          },
        );

        return undefined;
      }

      if (!matchingOrder.inStatus(OrderStatus.Requested)) {
        this.logger.warning(
          `${findableKeyword} invalid order status: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} cannot be processed on ${matchingOrder.getStatus()}`,
          {
            order,
            transaction,
          },
        );

        return undefined;
      }

      if (matchingOrder.hasPayments()) {
        this.logger.warning(
          `${findableKeyword} duplicated: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} already paid`,
          {
            order,
            transaction,
          },
        );

        return undefined;
      }

      if (matchingOrder.isExpired()) {
        this.logger.warning(
          `${findableKeyword} order expired: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} expired at ${matchingOrder
            .getExpiresAt()
            ?.toISOString()} but paid at ${new Date().toISOString()}`,
          {
            order,
            transaction,
          },
        );
        // create new order, add parent_id (recreate-quote-usecase*)
        // TODO: new value = valuePaid - (estimatedGasValue - order.gasValue* adicionar campo )
        // TODO: aqui podemos gravar também o diff do valor do gas atual x valor pago
        // matchingOrder = .execute()
        // TODO: atualizar a anterior (parent), para expired
        return undefined;
      }

      const payment: Payment = await this.createPaymentInteractor.execute(
        new Payment({
          orderId: matchingOrder.getId(),
          clearingId: clearing.getId(),
          providerId: providerPaymentId,
          providerEndToEndId: providerPaymentEndToEndId,
          providerTimestamp,
          effectiveDate,
          total: Number(amountPaid),
        }),
      );

      matchingOrder.setStatus(OrderStatus.Confirmed);

      await this.orderTransitionInteractor.execute(matchingOrder, {
        reason: `#${payment.getSequence()} streamed from ${clearing.getId()} with external: ${providerPaymentId}`,
      });

      return {
        payment,
        order: matchingOrder,
      };
    } catch (err) {
      this.logger.debug(
        `skipping ${
          transaction.providerPaymentId
        }: order ${matchingOrder.getId()} already processed`,
        {
          err,
          order,
          transaction,
        },
      );

      return undefined;
    }
  }
}
