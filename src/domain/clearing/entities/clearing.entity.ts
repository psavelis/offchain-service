import {Entity, type Props} from '../../common/entity';
import {type Order} from '../../order/entities/order.entity';
import {type Payment} from '../../payment/entities/payment.entity';

export enum ClearingStatus {
	Empty = 1,
	Faulted = 2,
	RanToCompletion = 3,
}

export type Result = {
	order: Order;
	payment: Payment;
};

export type ClearingProps = {
	hash: string;
	target: string;
	offset: string;
	createdAt?: Date;
	status?: ClearingStatus;
	endedAt?: Date;
	durationMs?: number;
	totalEntries?: number;
	totalAmount?: number;
	remarks?: string;
	sequence?: number;
} & Props;

export class Clearing extends Entity<ClearingProps> {
  constructor(props: ClearingProps, id?: string) {
    super(props, id);

    if (id) {
      return;
    }

    this.props.status = this.props.status ?? ClearingStatus.Empty;
  }

  public setStatus(newStatus: ClearingStatus) {
    this.props.status = newStatus;
  }

  public getOffset(): string {
    return this.props.offset;
  }

  public getHash(): string {
    return this.props.hash;
  }

  public setRemarks(remarks: string) {
    this.props.remarks = remarks;
  }

  public getSequence() {
    return this.props.sequence;
  }

  public getRemarks() {
    return this.props.remarks;
  }

  public getTotalAmount() {
    return this.props.totalAmount;
  }

  public getTotalEntries() {
    return this.props.totalEntries;
  }

  public getDurationMs() {
    return this.props.durationMs;
  }

  public getEndedAt() {
    return this.props.endedAt;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }

  public getStatus() {
    return this.props.status;
  }

  public getTarget() {
    return this.props.target;
  }

  public addPayments(processedPayments: Record<string, Result>) {
    const ids = Object.keys(processedPayments);

    this.props.totalEntries = ids.length;
    this.props.totalAmount = 0;
    this.props.endedAt = new Date();
    this.props.durationMs =
      this.props.endedAt.getTime() - this.props.createdAt.getTime();

    for (const id of ids) {
      const processed = processedPayments[id];

      if (!processed) return;

      this.props.totalAmount += processed.order.getTotal();
    }
  }
}
