import {Entity, type Props} from '../../common/entity';

export type PaymentProps = {
	orderId: string;
	clearingId: string;
	providerId: string;
	providerEndToEndId: string;
	providerTimestamp: string;
	effectiveDate: string;
	total: number;
	sequence?: number;
} & Props;

export class Payment extends Entity<PaymentProps> {
  constructor(props: PaymentProps, id?: string) {
    super(props, id);

    if (id) {
      return;
    }
  }

  public getOrderId(): string {
    return this.props.orderId;
  }

  public getClearingId(): string {
    return this.props.clearingId;
  }

  public getProviderId(): string {
    return this.props.providerId;
  }

  public getProviderEndToEndId(): string {
    return this.props.providerEndToEndId;
  }

  public getProviderTimestamp(): string {
    return this.props.providerTimestamp;
  }

  public getEffectiveDate(): string {
    return this.props.effectiveDate;
  }

  public getSequence(): number {
    return this.props.sequence ?? 0;
  }

  public getTotal(): number {
    return this.props.total;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }
}
