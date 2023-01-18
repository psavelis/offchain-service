import { LoggablePort } from '../../common/ports/loggable.port';
import { Clearing, ClearingStatus } from '../entities/clearing.entity';
import { Order } from '../../order/entities/order.entity';
import { Statement } from '../value-objects/statement.value-object';
import { Transaction } from '../value-objects/transaction.value-object';
import { CreateClearingInteractor } from '../interactors/create-clearing.interactor';
import { FetchOrderBatchInteractor } from '../../order/interactors/fetch-order-batch.interactor';
import { ProcessStatementTransactionInteractor } from '../interactors/process-statement-transaction.interactor';
import { FetchableClearingPort } from '../ports/fetchable-clearing.port';
import { PersistableClearingPort } from '../ports/persistable-clearing.port';

import {
  FetchableStatementPort,
  StatementParameter,
} from '../ports/fetchable-statement.port';

import {
  ConfirmationRecord,
  ProviderPaymentId,
} from '../dtos/confirmation-record.dto';

import {
  EndToEndId,
  OrderDictionary,
} from '../../order/dtos/order-dictionary.dto';

const MAX_CACHED_KEYS = 2000;

export class CreateClearingUseCase implements CreateClearingInteractor {
  private cache: Record<ProviderPaymentId, boolean>;

  constructor(
    readonly logger: LoggablePort,
    readonly fetchableClearingPort: FetchableClearingPort,
    readonly fetchableStatementPort: FetchableStatementPort,
    readonly persistableClearingPort: PersistableClearingPort,
    readonly fetchOrderBatchInteractor: FetchOrderBatchInteractor,
    readonly processTransactionInteractor: ProcessStatementTransactionInteractor,
  ) {
    this.cache = {};
  }

  private resizeCache() {
    if (Object.keys(this.cache).length > MAX_CACHED_KEYS) {
      this.cache = {};
    }
  }

  public async execute() {
    const lastClearing: Clearing | undefined =
      await this.fetchableClearingPort.fetchLast();

    const statementParameter =
      this.fetchableStatementPort.getStatementParameter(lastClearing);

    let statement: Statement;

    try {
      statement = await this.fetchableStatementPort.fetch(statementParameter);
    } catch (err) {
      const remarks = `statement unavailable: ${err} ($${JSON.stringify(err)})`;

      this.logger.error(err, remarks, statementParameter);

      await this.persistableClearingPort.create(
        new Clearing({
          hash: String(),
          target: statementParameter.target,
          offset: statementParameter.offset,
          status: ClearingStatus.Faulted,
          remarks,
        }),
      );

      throw err;
    }

    const hash = statement.getHash();

    const notChanged = lastClearing?.getHash && hash === lastClearing.getHash();

    if (notChanged) {
      return lastClearing;
    }

    const clearing = await this.createClearing(
      hash,
      statementParameter,
      statement,
    );

    this.logger.debug('clearing completed', clearing);

    return clearing;
  }

  private async createClearing(
    hash: string,
    statementParameter: StatementParameter,
    statement: Statement,
  ) {
    let clearing: Clearing = await this.persistableClearingPort.create(
      new Clearing({
        hash,
        target: statementParameter.target,
        offset: statementParameter.offset,
      }),
    );

    const processedPayments: Record<ProviderPaymentId, ConfirmationRecord> = {};

    clearing = await this.processStatement(
      statement,
      clearing,
      processedPayments,
    );

    this.resizeCache();

    const deleteEmptyClearing =
      !clearing.getTotalAmount() && !clearing.getTotalEntries();

    if (deleteEmptyClearing) {
      await this.persistableClearingPort.remove(clearing);

      return clearing;
    }

    await this.persistableClearingPort.update(clearing);

    return clearing;
  }

  private async processStatement(
    initialStatement: Statement,
    clearing: Clearing,
    processedPayments: Record<string, ConfirmationRecord>,
  ): Promise<Clearing> {
    let currentStatement = initialStatement;

    try {
      do {
        const endIds = currentStatement.transactions
          .map((transaction: Transaction) => {
            const alreadyProcessed = this.cache[transaction.providerPaymentId];

            if (alreadyProcessed) {
              return String(0);
            }

            return transaction.endToEndId;
          })
          .filter(isValid);

        const orders: Record<EndToEndId, Order> =
          await this.fetchOrderBatchInteractor.fetchMany(endIds);

        const processPromises: Array<Promise<void>> =
          currentStatement.transactions.map((transaction: Transaction) => {
            return this.processStatementTransaction(
              transaction,
              clearing,
              orders,
              processedPayments,
            );
          });

        await Promise.all(processPromises); // TODO: melhoria: chunk split,?

        clearing.addPayments(processedPayments);

        if (currentStatement.lastPage) {
          break;
        }

        currentStatement = await this.fetchableStatementPort.fetchNext(
          currentStatement,
        );
      } while (currentStatement.currentPage <= currentStatement.totalPages);
    } catch (err) {
      clearing.setStatus(ClearingStatus.Faulted);
      clearing.setRemarks(`fault: ${err} ($${JSON.stringify(err)})`);

      return clearing;
    }

    if (Object.keys(processedPayments).length === 0) {
      clearing.setStatus(ClearingStatus.Empty);

      return clearing;
    }

    clearing.setStatus(ClearingStatus.RanToCompletion);

    return clearing;
  }

  private async processStatementTransaction(
    transaction: Transaction,
    clearing: Clearing,
    orders: OrderDictionary,
    processedPayments: Record<ProviderPaymentId, ConfirmationRecord>,
  ): Promise<void> {
    const { endToEndId, providerPaymentId } = transaction;

    if (this.cache[providerPaymentId]) {
      return;
    }

    const order: Order = orders[endToEndId];

    if (!order) {
      // TODO: melhoria: inserir em tabelas de 'não-identificados'?
      this.logger.warning(
        `NotFound: Unknown endToEndId '${endToEndId}' (ProviderID: ${providerPaymentId}).`,
        { hash: clearing.getHash(), id: clearing.getId() },
      );

      this.cache[providerPaymentId] = true;
      return;
    }

    const result: ConfirmationRecord | undefined =
      await this.processTransactionInteractor.execute(
        order,
        transaction,
        clearing,
      );

    this.cache[providerPaymentId] = true;

    if (result) {
      processedPayments[providerPaymentId] = result;

      this.logger.info(
        `Confirmed: #${result.payment.getSequence()} (ProviderID: ${providerPaymentId}) => OrderID: ${order.getId()})`,
      );

      return;
    }
  }
}

const isValid = (id): boolean => {
  if (id?.length !== 25 && id?.length !== 24) return false;

  // TODO: hashear base36 => uuidv4
  return true;
};
