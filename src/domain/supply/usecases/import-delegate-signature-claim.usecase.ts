import { OnChainUserReceipt } from '../dtos/onchain-user-receipt.dto';
import { ImportDelegateSignatureClaimInteractor } from '../interactors/import-delegate-signature-claim.interactor';
import { FetchableDelegateClaimEventPort } from '../ports/fetchable-delegate-claim-event.port';
import { FetchableOrderPort } from '../../order/ports/fetchable-order.port';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { OnchainDelegateClaimEvent } from '../dtos/onchain-delegate-claim-event.dto';
import { LoggablePort } from '../../common/ports/loggable.port';
import { Settings } from '../../common/settings';
import { EncryptionPort } from '../../common/ports/encryption.port';

type PaymentSequence = number;
type UnsettledDictionary = Record<PaymentSequence, Order>;

export class ImportDelegateSignatureClaimUseCase
  implements ImportDelegateSignatureClaimInteractor
{
  constructor(
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
    readonly logger: LoggablePort,
    readonly fetchableDelegateClaimEventPort: FetchableDelegateClaimEventPort,
    readonly fetchableOrderPort: FetchableOrderPort,
  ) {}

  async execute(): Promise<OnchainDelegateClaimEvent[]> {
    const [orders, userReceipts] = await Promise.all([
      this.fetchableOrderPort.fetchLockedAndNotClaimedInStatus(
        OrderStatus.Owned,
        OrderStatus.Challenged,
      ),
      this.fetchableDelegateClaimEventPort.fetch(),
    ]);

    const claimedWithSignature = this.reconcile(
      Object.values(orders),
      userReceipts,
    );

    return claimedWithSignature;
  }

  async reconcile(
    unsettledOrders: Order[],
    onchainUserReceipts: OnChainUserReceipt[],
  ): Promise<OnchainDelegateClaimEvent[]> {
    const orders: UnsettledDictionary = this.parseDictionary(unsettledOrders);

    const settled: OnchainDelegateClaimEvent[] = [];

    for (const userReceipt of onchainUserReceipts) {
      const order = orders[userReceipt.paymentSequence];

      if (!order) {
        continue;
      }

      if (order.getTotalKnn() !== userReceipt.amountInKnn) {
        this.logger.warning(
          `[reconcile-unsettled-orders] Order ${order.getId()} (Payment #${order.getPaymentSequence()}) has a mismatched claimed amount. Expected ${order.getTotalKnn()} but got ${
            userReceipt.amountInKnn
          }`,
        );

        continue;
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
