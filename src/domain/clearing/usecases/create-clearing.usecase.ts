import { Clearing } from '../entities/clearing.entity';
import { PartnerStatement } from '../entities/partner-statement.entity';
import { CreateClearingInteractor } from '../interactors/create-clearing.interactor';

const DEFAULT_START_OFFSET_MS = 1_000 * 8 * 60 ** 2;

export class CreateClearingUseCase implements CreateClearingInteractor {
  constructor(
    readonly fetchableClearingPort: FetchableClearingPort,
    readonly fetchableStatementPort: FetchableStatementPort,
    readonly persistableClearingPort: PersistableClearingPort,
    readonly createPaymentInteractor: CreatePaymentInteractor,
    readonly orderTransitionInteractor: OrderTransitionInteractor,
    readonly dispatchSupplyInteractor: DispatchSupplyInteractor,
  ) {}

  async execute() {
    const lastRan: Clearing = await this.fetchableClearingPort.fetchLast();
    const lastOffset = lastRan?.getOffset();
    const newOffset = new Date();

    const target = lastOffset
      ? new Date(Date.parse(lastOffset) - DEFAULT_START_OFFSET_MS)
      : new Date(newOffset.getTime());

    let statement: PartnerStatement =
      await this.fetchableStatementPort.fetchOffset(target, newOffset);

    const currentHash = statement.getHash();

    const notChanged = lastRan?.getHash && currentHash === lastRan.getHash();

    if (notChanged) {
      return;
    }

    let clearing: Clearing = await this.persistableClearingPort.save(
      new Clearing({}),
    );

    let currentPage = 1;

    const payments = Record<>;

    do {
      const hasOrder = (p) => p && p.getId && p.getId() && p?.getOrderId(); // TODO: jogar para o payment, .hasOrder

      const newPayments = (
        await Promise.all(
          statement.transactions.map(
            (partnerTransaction: PartnerTransaction) => {
              try {
                const payment = payments[partnerTransaction.idempodencyKey];
                // TODO: get order
                // TODO: check expiration, check duppOrder = create new order + add parent_id
                // TODO: abater gas da order passada //
                // TODO: insert payment // CreatePaymentInteractor
                // TODO: update order status // orderTransitionInteractor
                // TODO: update claim lock // dispatchSupply
                // TODO: update order status // orderTransitionInteractor
                // TODO:
              } catch (err) {
                // TODO:  log!!!
                return undefined;
              }
            },
          ),
        )
      ).filter(hasOrder);

      clearing.addPayments(newPayments);

      if (statement.isLastPage()) {
        break;
      }

      // TODO: fetch proximas páginas (while ultimaPagina: false)
      currentPage++;

      statement = await this.fetchableStatementPort.appendPage(
        statement,
        currentPage,
      );
    } while (currentPage <= statement.getTotalPages());

    // todo: UPDATE CLEARING STATS
    clearing: Clearing = await this.persistableClearingPort.save(
      new Clearing({}),
    );
  }
}
