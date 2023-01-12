import { Entity, Props } from '../../common/entity';

export interface PaymentProps extends Props {
  orderId: string;
  clearingId: string;
  providerId: string;
  providerTimestamp: string;
  effectiveDate: string;
  total: number;
  sequence?: number;
}

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

  public getSequence(): number {
    return this.props.sequence ?? 0;
  }
}
