import { type LoggablePort } from '../../common/ports/loggable.port';
import { type Settings } from '../../common/settings';
import { formatDecimals } from '../../common/util';
import { OrderStatus, type Order } from '../../order/entities/order.entity';
import { type CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { type RefreshOrderInteractor } from '../../order/interactors/refresh-order.interactor';
import { Payment } from '../../payment/entities/payment.entity';
import { type CreatePaymentInteractor } from '../../payment/interactors/create-payment-interactor';
import { type CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { type ConfirmationRecord } from '../dtos/confirmation-record.dto';
import { type Clearing } from '../entities/clearing.entity';
import { type ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';
import { type Transaction } from '../value-objects/transaction.value-object';

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
    readonly settings: Settings,
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
    const matchingOrder = order;

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
          this.logger.warn(
            `${findableKeyword} duplicated: ${
              transaction.providerPaymentId
            }: order ${matchingOrder.getId()} already paid`,
          );
        }

        console.log(
          `processStmtTx::matchingOrder.hasPayments: ${JSON.stringify(
            matchingOrder,
          )}`,
        );
        return undefined;
      }

      const expectedAmount = matchingOrder.getTotal().toFixed(2);

      const amountNotExact = expectedAmount !== amountPaid;

      if (amountNotExact) {
        this.logger.warn(
          `${findableKeyword} incorrect amount: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} expects '${expectedAmount}' (order.total: ${matchingOrder.getTotal()}) but received '${amountPaid}'`,
        );

        return undefined;
      }

      if (!matchingOrder.inStatus(OrderStatus.Requested, OrderStatus.Expired)) {
        this.logger.warn(
          `${findableKeyword} invalid order status: ${
            transaction.providerPaymentId
          }: order ${matchingOrder.getId()} cannot be processed on ${matchingOrder.getStatus()}`,
        );

        return undefined;
      }

      if (matchingOrder.isExpired()) {
        console.log(
          `processStmtTx::matchingOrder.isExpired: ${JSON.stringify(
            matchingOrder,
          )}`,
        );

        matchingOrder.setStatus(OrderStatus.Expired);

        await this.orderTransitionInteractor.execute(matchingOrder, {
          reason: '[clearing] paid after expiration',
        });

        const refreshed = await this.createQuoteInteractor.execute({
          amount: {
            unassignedNumber: expectedAmount.replace(/\D/g, ''),
            decimals: 2,
            isoCode: 'BRL',
          },
          chainId: matchingOrder.getDesiredChainId(),
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

      const reason = `#${payment.getSequence()} streamed from cID:${clearing.getId()} with external: ${providerPaymentId}`;

      await this.orderTransitionInteractor.execute(matchingOrder, {
        reason,
      });

      this.logger.info(
        `New Payment Confirmed: ${order.getEndToEndId()} was sucessfuly paid (#${payment.getSequence()})`,
      );

      return {
        payment,
        order: matchingOrder,
      };
    } catch (err) {
      console.warn(
        `skipping ${
          transaction.providerPaymentId
        }: order ${matchingOrder.getId()} already processed => ${
          err.message
        } @ ${err.stack}`,
      );

      return undefined;
    }
  }
}
