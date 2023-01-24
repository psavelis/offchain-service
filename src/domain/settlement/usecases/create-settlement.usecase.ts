import { CreateSettlementInteractor } from '../interactors/create-settlement.interactor';
import { ProcessOrderSettlementInteractor } from '../interactors/process-order-settlement.interactor';
import { FetchOrderBatchInteractor } from '../../order/interactors/fetch-order-batch.interactor';
import { Order } from '../../order/entities/order.entity';
import { OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
import { LoggablePort } from '../../common/ports/loggable.port';

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
        this.logger.info(
          `[init] settlement of #${sequence} started (${orderWithPayment.order.getId()})`,
        );

        await this.processOrderSettlementInteractor.execute(orderWithPayment);
      } catch (err) {
        this.logger.error(
          err,
          `[error] settlement of #${sequence} FAILED (${orderWithPayment.order.getId()})`,
        );
      }
    }
  }
}
