import { OnChainUserReceipt } from '../dtos/onchain-user-receipt.dto';
import { ReconcileDelegateSignatureClaimInteractor } from '../interactors/reconcile-delegate-signature-claim.interactor';
import { FetchableDelegateClaimEventPort } from '../ports/fetchable-delegate-claim-event.port';
import { FetchableOrderPort } from '../../order/ports/fetchable-order.port';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { OnchainDelegateClaimEvent } from '../dtos/onchain-delegate-claim-event.dto';
import { LoggablePort } from '../../common/ports/loggable.port';

type PaymentSequence = number;
type UnsettledDictionary = Record<PaymentSequence, Order>;

export class ReconcileDelegateSignatureClaimUseCase
  implements ReconcileDelegateSignatureClaimInteractor
{
  constructor(
    readonly logger: LoggablePort,
    readonly fetchableDelegateClaimEventPort: FetchableDelegateClaimEventPort,
    readonly fetchableOrderPort: FetchableOrderPort,
  ) {}

  async execute(): Promise<OnchainDelegateClaimEvent[]> {
    const [orders, userReceipts] = await Promise.all([
      this.fetchableOrderPort.fetchLockedAndNotClaimedInStatus(
        OrderStatus.Owned,
        OrderStatus.Challenged,
        OrderStatus.Locked,
      ),
      this.fetchableDelegateClaimEventPort.fetch(),
    ]);

    const claimedWithSignature = this.reconcile(
      Object.values(orders),
      userReceipts,
    );

    return claimedWithSignature;
  }

  reconcile(
    unsettledOrders: Order[],
    onchainUserReceipts: OnChainUserReceipt[],
  ): OnchainDelegateClaimEvent[] {
    const orders: UnsettledDictionary = this.parseDictionary(unsettledOrders);

    const settled: OnchainDelegateClaimEvent[] = [];

    for (const userReceipt of onchainUserReceipts) {
      const order = orders[userReceipt.paymentSequence];

      if (!order) {
        continue;
      }

      if (
        order.getTotalKnn() > userReceipt.amountInKnn + 0.001 ||
        order.getTotalKnn() < userReceipt.amountInKnn - 0.001
      ) {
        this.logger.warning(
          `[SECURITY][reconcile-unsettled-orders] Order ${order.getId()} (Payment #${order.getPaymentSequence()}) has a mismatched claimed amount. Expected ${order.getTotalKnn()} but got ${
            userReceipt.amountInKnn
          }`,
        );

        continue;
      }

      if (order.getStatus() === OrderStatus.Locked) {
        this.logger.warning(
          `[SECURITY][reconcile-unsettled-orders] Order ${order.getId()} (Payment #${order.getPaymentSequence()}) was claimed without answering the challenge`,
        );
      }

      settled.push({
        order,
        userReceipt,
      });
    }

    return settled;
  }

  parseDictionary(unsettledOrders: Order[]): UnsettledDictionary {
    return unsettledOrders.reduce(
      (record: UnsettledDictionary, order: Order) => {
        const sequenceNumber = order.getPaymentSequence();

        if (sequenceNumber) {
          record[sequenceNumber] = order;
        }

        return record;
      },
      {} as UnsettledDictionary,
    );
  }
}
