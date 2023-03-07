import { RefreshOrderInteractor } from '../../order/interactors/refresh-order.interactor';
import { LoggablePort } from '../../common/ports/loggable.port';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { Payment } from '../../payment/entities/payment.entity';
import { CreatePaymentInteractor } from '../../payment/interactors/create-payment-interactor';
import { ConfirmationRecord } from '../dtos/confirmation-record.dto';
import { Clearing } from '../entities/clearing.entity';
import { ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';
import { Transaction } from '../value-objects/transaction.value-object';
import { CreateQuoteInteractor } from 'src/domain/price/interactors/create-quote.interactor';
import { formatDecimals } from 'src/domain/common/util';

const DEFAULT_BRL_TRUNCATE_OPTIONS = {
  truncateDecimals: 2,
};

const DEFAULT_KNN_TRUNCATE_OPTIONS = {
  truncateDecimals: 8,
};

const findableKeyword = '#payment-process';
export class ProcessStatementTransactionUseCase
  implements ProcessStatementTransactionInteractor
{
  constructor(
    readonly logger: LoggablePort,
    readonly createPaymentInteractor: CreatePaymentInteractor,
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly refreshOrderInteractor: RefreshOrderInteractor,
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

      if (matchingOrder.hasPayments()) {
        if (matchingOrder.getPaymentProviderId() !== providerPaymentId) {
          this.logger.warning(
            `${findableKeyword} duplicated: ${
              transaction.providerPaymentId
            }: order ${matchingOrder.getId()} already paid`,
          );
        }

        return undefined;
      }

      const expectedAmount = matchingOrder.getTotal().toFixed(2);

      const amountNotExact = expectedAmount !== amountPaid;

      if (amountNotExact) {
        this.logger.warning(
          `${findableKeyword} incorrect amount: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} expects '${expectedAmount}' (order.total: ${matchingOrder.getTotal()}) but received '${amountPaid}'`,
        );

        return undefined;
      }

      if (!matchingOrder.inStatus(OrderStatus.Requested)) {
        this.logger.warning(
          `${findableKeyword} invalid order status: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} cannot be processed on ${matchingOrder.getStatus()}`,
        );

        return undefined;
      }

      if (matchingOrder.isExpired()) {
        matchingOrder.setStatus(OrderStatus.Expired);

        await this.orderTransitionInteractor.execute(matchingOrder, {
          reason: `[clearing] paid after expiration`,
        });

        const refreshed = await this.createQuoteInteractor.execute({
          amount: {
            unassignedNumber: expectedAmount,
            decimals: 2,
            isoCode: 'BRL',
          },
          transactionType:
            matchingOrder.getIdentifierType() === 'EA' ? 'LockSupply' : 'Claim',
        });

        const total = Number(
          formatDecimals(
            refreshed.total.BRL.unassignedNumber,
            refreshed.total.BRL.decimals,
            DEFAULT_BRL_TRUNCATE_OPTIONS,
          ),
        );

        const totalGas = Number(
          formatDecimals(
            refreshed.gasAmount.BRL.unassignedNumber,
            refreshed.gasAmount.BRL.decimals,
            DEFAULT_BRL_TRUNCATE_OPTIONS,
          ),
        );

        const totalNet = Number(
          formatDecimals(
            refreshed.netTotal.BRL.unassignedNumber,
            refreshed.netTotal.BRL.decimals,
            DEFAULT_BRL_TRUNCATE_OPTIONS,
          ),
        );

        const totalKnn = Number(
          formatDecimals(
            refreshed.finalAmountOfTokens.unassignedNumber,
            refreshed.finalAmountOfTokens.decimals,
            DEFAULT_KNN_TRUNCATE_OPTIONS,
          ),
        );

        matchingOrder.setAmountOfTokens(refreshed.finalAmountOfTokens);
        matchingOrder.setTotal(total);
        matchingOrder.setTotalGas(totalGas);
        matchingOrder.setTotalNet(totalNet);
        matchingOrder.setTotalKnn(totalKnn);

        await this.refreshOrderInteractor.refresh(matchingOrder);
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
        },
      );

      return undefined;
    }
  }
}
