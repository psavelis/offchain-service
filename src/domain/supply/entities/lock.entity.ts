import {Entity, type Props} from '../../common/entity';

export type LockProps = {
	paymentId: string;
	offchainAddress: string;
	orderId: string;
	uint256Amount: string;
	createdAt: Date;
	transactionHash?: string;
	updatedAt?: Date;
} & Props;

export class LockEntity extends Entity<LockProps> {
  constructor(props: LockProps, id?: string) {
    super(props, id);
  }

  public getPaymentId(): string {
    return this.props.paymentId;
  }

  public getOffchainAddress(): string {
    return this.props.offchainAddress;
  }

  public getOrderId(): string {
    return this.props.orderId;
  }

  public getUint256Amount(): string {
    return this.props.uint256Amount;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getTransactionHash(): string | undefined {
    return this.props.transactionHash;
  }

  public setTransactionHash(transactionHash: string): void {
    this.props.transactionHash = transactionHash;
  }

  public getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
