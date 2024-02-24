import {type OrderWithPayment} from '../../order/dtos/order-with-payment.dto';
import {OrderStatus} from '../../order/entities/order.entity';
import {type DispatchSupplyInteractor} from '../interactors/dispatch-supply.interactor';
import {type ClaimSupplyPort} from '../ports/claim-supply.port';
import {type OrderWithReceipt} from '../dtos/order-with-receipt.dto';
import {type ClaimSupplyDto} from '../dtos/claim-supply.dto';
import {type LockSupplyPort} from '../ports/lock-supply.port';
import {type LockSupplyDto} from '../dtos/lock-supply.dto';
import {type PersistableClaimPort} from '../ports/persistable-claim.port';
import {Claim} from '../entities/claim.entity';
import {LockEntity} from '../entities/lock.entity';
import {type PersistableLockPort} from '../ports/persistable-lock.port';
import {type OnChainReceipt} from '../dtos/onchain-receipt.dto';
import {type PersistableReceiptPort} from '../ports/persistable-receipt.port';
import {Receipt} from '../entities/receipt.entity';
import {type EncryptionPort} from '../../common/ports/encryption.port';
import {type Settings} from '../../common/settings';
import {type LoggablePort} from '../../common/ports/loggable.port';
import {NetworkType} from '../../common/enums/network-type.enum';
import {LayerType} from '../../common/enums/layer-type.enum';
import {Chain} from '../../common/entities/chain.entity';

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
    const desiredChain = new Chain(order.getDesiredChainId());

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
        chain: desiredChain,
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
        new Receipt({...receipt, orderId: order.getId()}),
      );

      claim.setTransactionHash(receipt.transactionHash);

      await this.persistableClaimPort.update(claim);

      const chain = new Chain(receipt.chainId);

      order.setStatus(OrderStatus.Claimed);

      this.logger.info(
        `Settlement: ${order.getEndToEndId()} (Nonce ${
          payment.sequence
        }) was succesfuly settled on holder wallet at ${
          NetworkType[chain.id]
        } ${LayerType[chain.layer]} (Txn: ${chain.getBlockExplorerUrl(
          receipt.transactionHash,
        )})`,
      );

      return {
        order,
        receipt,
      };
    } else if (identifierType === Email) {
      const lockPayload: LockSupplyDto = {
        chain: desiredChain,
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
        new Receipt({...receipt, orderId: order.getId()}),
      );

      lock.setTransactionHash(receipt.transactionHash);

      await this.persistableLockPort.update(lock);

      order.setStatus(OrderStatus.Locked);

      const chain = new Chain(receipt.chainId);

      this.logger.info(
        `Settlement: ${order.getEndToEndId()} (Nonce ${
          payment.sequence
        }) was succesfuly locked to holder email at ${NetworkType[chain.id]} ${
          LayerType[chain.layer]
        } (Txn: ${chain.getBlockExplorerUrl(receipt.transactionHash)})`,
      );

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
