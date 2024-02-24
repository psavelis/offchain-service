import { type LoggablePort } from '../../common/ports/loggable.port';
import { type OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
import { type FetchOrderBatchInteractor } from '../../order/interactors/fetch-order-batch.interactor';
import { type CreateSettlementInteractor } from '../interactors/create-settlement.interactor';
import { type ProcessOrderSettlementInteractor } from '../interactors/process-order-settlement.interactor';

const DEFAULT_BATCH_SIZE = 50;
export class CreateSettlementUseCase implements CreateSettlementInteractor {
  constructor(
    readonly logger: LoggablePort,
    readonly processOrderSettlementInteractor: ProcessOrderSettlementInteractor,
    readonly fetchOrderBatchInteractor: FetchOrderBatchInteractor,
  ) {}

  async execute(): Promise<void> {
    const ordersToProcess: Record<number, OrderWithPayment> =
      await this.fetchOrderBatchInteractor.fetchPendingSettlement(
        DEFAULT_BATCH_SIZE,
      );

    for (const sequence of Object.keys(ordersToProcess)) {
      const orderWithPayment = ordersToProcess[sequence];

      try {
        this.logger.debug(
          `[init] settlement of #${sequence} started (${orderWithPayment.order.getId()})`,
        );

        await this.processOrderSettlementInteractor.execute(orderWithPayment);
      } catch (err) {
        console.error(
          `[error] settlement of #${sequence} FAILED (${orderWithPayment.order.getId()}) stack: ${
            err.stack
          }, msg: ${err.message} ${JSON.stringify(orderWithPayment)}`,
        );
      }
    }
  }
}
