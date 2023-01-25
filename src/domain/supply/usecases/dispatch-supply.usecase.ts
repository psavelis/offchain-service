import { OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
import { OrderStatus } from '../../order/entities/order.entity';
import { DispatchSupplyInteractor } from '../interactors/dispatch-supply.interactor';
import { ClaimSupplyPort } from '../ports/claim-supply.port';
import { OrderWithReceipt } from '../dtos/order-with-receipt.dto';
import { ClaimSupplyDto } from '../dtos/claim-supply.dto';
import { LockSupplyPort } from '../ports/lock-supply.port';
import { LockSupplyDto } from '../dtos/lock-supply.dto';
import { PersistableClaimPort } from '../ports/persistable-claim.port';
import { Claim } from '../entities/claim.entity';
import { LockEntity } from '../entities/lock.entity';
import { PersistableLockPort } from '../ports/persistable-lock.port';
import { OnChainReceipt } from '../dtos/onchain-receipt.dto';
import { PersistableReceiptPort } from '../ports/persistable-receipt.port';
import { Receipt } from '../entities/receipt.entity';
import { EncryptionPort } from 'src/domain/common/ports/encryption.port';
import { Settings } from 'src/domain/common/settings';
import { LoggablePort } from 'src/domain/common/ports/loggable.port';

const Email = 'EA';
const CryptoWallet = 'CW';

export class DispatchSupplyUseCase implements DispatchSupplyInteractor {
  constructor(
    readonly logger: LoggablePort,
    readonly settings: Settings,
    readonly claimSupplyPort: ClaimSupplyPort,
    readonly lockSupplyPort: LockSupplyPort,
    readonly encryptionPort: EncryptionPort,
    readonly persistableClaimPort: PersistableClaimPort,
    readonly persistableReceiptPort: PersistableReceiptPort,
    readonly persistableLockPort: PersistableLockPort,
  ) {}

  async execute({
    order,
    payment,
  }: OrderWithPayment): Promise<OrderWithReceipt> {
    const identifierType = order.getIdentifierType();
    if (identifierType === CryptoWallet) {
      const decryptedAddress = await this.encryptionPort
        .decrypt(
          order.getUserIdentifier(),
          order.getId(),
          this.settings.cbc.key,
        )
        .catch((err) => {
          this.logger.error(err, '[decrypt identifier error ] wallet');

          return order.getUserIdentifier();
        });

      const claimPayload: ClaimSupplyDto = {
        onchainAddress: decryptedAddress,
        amount: order.getAmountOfTokens(),
        nonce: payment.sequence,
      };

      await this.claimSupplyPort.verify(claimPayload);

      const claim: Claim = await this.persistableClaimPort.create(
        new Claim({
          paymentId: payment.id,
          onchainAddress: order.getUserIdentifier(),
          orderId: order.getId(),
          uint256Amount: order.getAmountOfTokens().unassignedNumber,
          createdAt: new Date(),
        }),
      );

      const receipt: OnChainReceipt = await this.claimSupplyPort.claim(
        claimPayload,
      );

      await this.persistableReceiptPort.create(
        new Receipt({ ...receipt, orderId: order.getId() }),
      );

      claim.setTransactionHash(receipt.transactionHash);

      await this.persistableClaimPort.update(claim);

      order.setStatus(OrderStatus.Claimed);

      return {
        order,
        receipt,
      };
    } else if (identifierType === Email) {
      const lockPayload: LockSupplyDto = {
        amount: order.getAmountOfTokens(),
        nonce: payment.sequence,
      };

      await this.lockSupplyPort.verify(lockPayload);

      const lock: LockEntity = await this.persistableLockPort.create(
        new LockEntity({
          paymentId: payment.id,
          offchainAddress: order.getUserIdentifier(),
          orderId: order.getId(),
          uint256Amount: order.getAmountOfTokens().unassignedNumber,
          createdAt: new Date(),
        }),
      );

      const receipt: OnChainReceipt = await this.lockSupplyPort.lock(
        lockPayload,
      );

      await this.persistableReceiptPort.create(
        new Receipt({ ...receipt, orderId: order.getId() }),
      );

      lock.setTransactionHash(receipt.transactionHash);

      await this.persistableLockPort.update(lock);

      order.setStatus(OrderStatus.Locked);

      return {
        order,
        receipt,
      };
    } else {
      throw new Error(
        `Invalid identifierType '${identifierType}' on order ${order.getId()}`,
      );
    }
  }
}
