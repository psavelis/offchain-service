import {Entity, type Props} from '../../../common/entity';
import {type EncryptionPort} from '../../../common/ports/encryption.port';
import {type Settings} from '../../../common/settings';
import {type AuditPoolEventType} from '../enums/audit-pool-event.enum';

export type AuditPoolEventProps = {
	userIdentifier: string;
	poolAddress: string;
	transactionHash: string;
	blockNumber: number;
	blockTimestamp: number;
	chainId: number;
	eventType: AuditPoolEventType;

	amountUint256?: string;
	amount?: number;

	gasUsed?: number;
	cumulativeGasUsed?: number;
	effectiveGasPrice?: number;
	stakeId?: number;
} & Props;

export class AuditPoolEvent extends Entity<AuditPoolEventProps> {
  setUserIdentifier(encryptedIdentifier: string) {
    this.props.userIdentifier = encryptedIdentifier;
  }

  getStakeId() {
    return this.props.stakeId;
  }

  getEffectiveGasPrice() {
    return this.props.effectiveGasPrice;
  }

  getCumulativeGasUsed() {
    return this.props.cumulativeGasUsed;
  }

  getGasUsed() {
    return this.props.gasUsed;
  }

  getAmount() {
    return this.props.amount;
  }

  getAmountUint256() {
    return this.props.amountUint256;
  }

  getBlockTimestamp() {
    return this.props.blockTimestamp;
  }

  getBlockNumber() {
    return this.props.blockNumber;
  }

  getPoolAddress() {
    return this.props.poolAddress;
  }

  setBlockTimestamp(timestamp: number) {
    this.props.blockTimestamp = timestamp;
  }

  setBlockNumber(blockNumber: number) {
    this.props.blockNumber = blockNumber;
  }

  async getFingerprint(encryptionPort: EncryptionPort, settings: Settings) {
    const hash = [
      this.props.userIdentifier,
      this.props.chainId,
      this.props.transactionHash,
      this.props.poolAddress,
      this.props.eventType,
    ].join('|');

    const fingerprint = await encryptionPort.encrypt(
      hash,
      this.props.transactionHash,
      settings.cbc.key,
    );

    return fingerprint;
  }

  getChainId() {
    return this.props.chainId;
  }

  getTransactionHash() {
    return this.props.transactionHash;
  }

  getEventType() {
    return this.props.eventType;
  }

  getUserIdentifier() {
    return this.props.userIdentifier;
  }
}
