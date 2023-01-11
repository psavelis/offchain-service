import {
  CurrencyAmount,
  IsoCodes,
} from '../../price/value-objects/currency-amount.value-object';
import { Entity, Props } from '../../common/entity';
import { Convert } from 'src/domain/common/uuid';

export enum PaymentOption {
  BrazilianPix = 1,
}

export enum OrderStatus {
  Requested = 1,
  Confirmed = 2,
  Locked = 3,
  Challenged = 4,
  Owned = 5,
  Claimed = 6,
  Expired = 7,
  Canceled = 8,
}

export type Email = 'EA';
export type CryptoWallet = 'CW';

const DEFAULT_ORDER_MINIMUM_TOTAL = 60.0;
const DEFAULT_ORDER_EXPIRATION = 7200 * 1_000;

const statusDictionary: Record<OrderStatus, string> = {
  [OrderStatus.Requested]: 'Aguardando Pagamento',
  [OrderStatus.Confirmed]: 'Em Processamento',
  [OrderStatus.Locked]: 'Reservado',
  [OrderStatus.Challenged]: 'Reservado',
  [OrderStatus.Owned]: 'Finalizado',
  [OrderStatus.Claimed]: 'Finalizado',
  [OrderStatus.Expired]: 'Cancelado',
  [OrderStatus.Canceled]: 'Cancelado',
};

export interface OrderProps extends Props {
  paymentOption: PaymentOption;
  isoCode: IsoCodes;
  total: number;
  amountOfTokens: CurrencyAmount;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;

  endToEndId?: string;
  status?: OrderStatus;
  expiresAt?: Date;
}

export class Order extends Entity<OrderProps> {
  constructor(props: OrderProps, id?: string) {
    super(props, id);

    if (id) {
      this.checkBindings();
      return;
    }

    if (props.total <= DEFAULT_ORDER_MINIMUM_TOTAL) {
      throw new Error('Invalid order total');
    }

    this.props.endToEndId = Order.toEndId(this._id);

    if (!this.props.expiresAt) {
      this.props.expiresAt = new Date(
        this.props.createdAt.getTime() + DEFAULT_ORDER_EXPIRATION,
      );
    }

    this.setStatus(OrderStatus.Requested);
  }

  private checkBindings() {
    if (this.props.endToEndId === Order.toEndId(this._id)) {
      return;
    }

    throw new Error('Unable to load order');
  }

  public setStatus(newStatus: OrderStatus) {
    this.props.status = newStatus;
  }

  public inStatus(status: OrderStatus): boolean {
    return this.props.status === status;
  }

  public getIdentifierType() {
    return this.props.identifierType;
  }

  public getUserIdentifier() {
    return this.props.userIdentifier;
  }

  public getPaymentOption() {
    return this.props.paymentOption;
  }

  public getIsoCode() {
    return this.props.isoCode;
  }

  public getEndToEndId(): string {
    return this.props.endToEndId;
  }

  public getTotal(): number {
    return this.props.total;
  }

  public getStatusDescription(): string {
    return Order.getStatusDescription(this.props.status);
  }

  static getStatusDescription(status: OrderStatus): string {
    return statusDictionary[status];
  }

  static toEndId(uuid: string): string {
    const base36 = Convert.toBase36(uuid).toUpperCase();

    if (base36.length === 25) {
      return base36;
    }

    throw new Error('Invalid order identifier');
  }
}
