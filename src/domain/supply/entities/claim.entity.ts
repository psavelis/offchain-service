import { Entity, Props } from '../../common/entity';

export interface ClaimProps extends Props {
  paymentId: string;
  onchainAddress: string;
  orderId: string;
  uint256Amount: string;
  createdAt: Date;
  transactionHash?: string;
  updatedAt?: Date;
}

export class Claim extends Entity<ClaimProps> {
  constructor(props: ClaimProps, id?: string) {
    super(props, id);
  }

  public getPaymentId(): string {
    return this.props.paymentId;
  }

  public getOnchainAddress(): string {
    return this.props.onchainAddress;
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
