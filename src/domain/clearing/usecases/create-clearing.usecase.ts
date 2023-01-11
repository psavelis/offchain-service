import { Order } from '../../order/entities/order.entity';
import { Payment } from '../../payment/entities/payment.entity';
import {
  ConfirmationRecord,
  ProviderPaymentId,
} from '../dtos/confirmation-record.dto';
import { Clearing } from '../entities/clearing.entity';
import { PartnerStatement } from '../entities/partner-statement.entity';
import { CreateClearingInteractor } from '../interactors/create-clearing.interactor';
import { ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';

const DEFAULT_START_OFFSET_MS = 1_000 * 8 * 60 ** 2;
const MAX_CACHE_SIZE = 2048;

export class CreateClearingUseCase implements CreateClearingInteractor {
  private skipCache: Record<ProviderPaymentId, boolean>;

  constructor(
    readonly fetchableClearingPort: FetchableClearingPort,
    readonly fetchableStatementPort: FetchableStatementPort,
    readonly persistableClearingPort: PersistableClearingPort,
    readonly processTransactionInteractor: ProcessStatementTransactionInteractor,
  ) {
    this.skipCache = {};
  }

  async execute() {
    const lastRan: Clearing = await this.fetchableClearingPort.fetchLast();
    const lastOffset = lastRan?.getOffset();
    const newOffset = new Date();

    const target = lastOffset
      ? new Date(Date.parse(lastOffset) - DEFAULT_START_OFFSET_MS)
      : new Date(newOffset.getTime());

    let statement: PartnerStatement =
      await this.fetchableStatementPort.fetchOffset(target, newOffset);

    // TODO: fazer catch do fetchOffset, se estiver fora, criar a clearing como failing e finalizar

    const currentHash = statement.getHash();

    const notChanged = lastRan?.getHash && currentHash === lastRan.getHash();

    if (notChanged) {
      return;
    }

    if (Object.keys(this.skipCache).length > MAX_CACHE_SIZE) {
      this.skipCache = {};
    }

    const clearing: Clearing = await this.persistableClearingPort.create(
      new Clearing({}),
    );

    let currentPage = 1;

    const confirmedPayments: Record<ProviderPaymentId, ConfirmationRecord> = {};

    do {
      const orders: Record<EndToEndId, Order> = {}; // TODO: pegar todos os ids de order, validar (retirar que estiverem no skipcache) e fazer busca
      await Promise.all(
        // TODO: reducer// for
        statement.transactions.map(async (trx: PartnerTransaction) => {
          const endToEndId: EndToEndId = trx.transactionId;
          const idempodencyKey: ProviderPaymentId = trx.providerPaymentId;

          if (this.skipCache[idempodencyKey]) {
            return;
          }

          const order: Order = orders[endToEndId];

          if (!order) {
            // TODO: logar inconsistência / notificar => pago sem order valida (esse é qd pix manual) => não tem como identificar para quem lockar ou enviar os tokens
            this.skipCache[idempodencyKey] = true;
            return;
          }

          const result: ConfirmationRecord | undefined =
            await this.processTransactionInteractor.tryConfirm(order, trx);

          this.skipCache[idempodencyKey] = true;

          if (result) {
            confirmedPayments[idempodencyKey] = result;
            return;
          }
        }),
      ); // todo: catch para atualizar a clearing como failing e finalizar

      clearing.addPayments(confirmedPayments);

      if (statement.isLastPage()) {
        break;
      }

      // TODO: ajustar o contexto de paginação
      // TODO: fetch proximas páginas (while ultimaPagina: false)
      currentPage++;

      statement = await this.fetchableStatementPort.appendPage(
        statement,
        currentPage,
      );
    } while (currentPage <= statement.getTotalPages());

    // todo: UPDATE CLEARING STATS
    await this.persistableClearingPort.update(clearing);
  }
}

export type EndToEndId = string;

const hasOrder = (payment: Payment) =>
  payment?.getOrderId && payment.getOrderId(); // TODO: jogar para o payment, .hasOrder
