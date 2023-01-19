import {
  CurrencyAmount,
  CurrencyIsoCode,
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

const DEFAULT_ORDER_MINIMUM_TOTAL = 60.0; // TODO:  parametrizar!
const DEFAULT_ORDER_EXPIRATION = 7200 * 1_000; // TODO: parametrizar!

const statusDictionary: Record<OrderStatus, string> = {
  [OrderStatus.Requested]: 'Aguardando Pagamento',
  [OrderStatus.Confirmed]: 'Em Processamento',
  [OrderStatus.Locked]: 'Reservado',
  [OrderStatus.Challenged]: 'Reservado',
  [OrderStatus.Owned]: 'Resgate Autorizado',
  [OrderStatus.Claimed]: 'Resgatado',
  [OrderStatus.Expired]: 'Expirado',
  [OrderStatus.Canceled]: 'Cancelado',
};

export interface OrderProps extends Props {
  paymentOption: PaymentOption;
  isoCode: CurrencyIsoCode;
  total: number;
  totalGas: number;
  totalNet: number;
  totalKnn: number;
  amountOfTokens: CurrencyAmount;
  userIdentifier: string;
  identifierType: Email | CryptoWallet;

  parentId?: string;
  clientIp?: string;
  clientAgent?: string;

  endToEndId?: string;
  status?: OrderStatus;
  expiresAt?: Date;
}

export class Order extends Entity<OrderProps> {
  private payments?: number;

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

    if (!this.props.status) this.setStatus(OrderStatus.Requested);
  }

  private checkBindings() {
    if (this.props.endToEndId !== Order.toEndId(this._id)) {
      throw new Error('Unable to load order');
    }

    this.props.total = Number(this.props.total);
    this.props.totalGas = Number(this.props.totalGas);
    this.props.totalKnn = Number(this.props.totalKnn);
    this.props.totalNet = Number(this.props.totalNet);
  }

  static toEndId(uuid: string): string {
    const base36 = Convert.toBase36(uuid).toUpperCase();

    if (base36.length === 25 || base36.length === 24) {
      return base36;
    }

    throw new Error('Invalid order identifier');
  }

  public setPayments(entries: number = 1) {
    this.payments = (this.payments || 0) + entries;
  }

  public hasPayments() {
    return (this.payments ?? 0) > 0;
  }

  public setStatus(newStatus: OrderStatus) {
    this.props.status = newStatus;
  }

  public inStatus(...status: OrderStatus[]): boolean {
    return status.includes(this.props.status);
  }

  public isExpired() {
    if (this.inStatus(OrderStatus.Expired, OrderStatus.Canceled)) {
      return true;
    }

    if (
      this.inStatus(OrderStatus.Requested) &&
      this.props.expiresAt?.getTime() < new Date().getTime()
    ) {
      return true;
    }

    return false;
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

  public getIsoCode(): CurrencyIsoCode {
    return this.props.isoCode;
  }

  public getEndToEndId(): string {
    return this.props.endToEndId;
  }

  public getTotal(): number {
    return this.props.total;
  }

  public getTotalGas(): number {
    return this.props.totalGas;
  }

  public getTotalNet(): number {
    return this.props.totalNet;
  }

  public getTotalKnn(): number {
    return this.props.totalKnn;
  }

  public getParentId() {
    return this.props.parentId;
  }

  public getExpiresAt() {
    return this.props.expiresAt;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }

  public getAmountOfTokens(): CurrencyAmount {
    return this.props.amountOfTokens;
  }

  public getClientAgent() {
    return this.props.clientAgent;
  }

  public getClientIp() {
    return this.props.clientIp;
  }

  public getStatus() {
    return this.props.status;
  }

  public getStatusDescription(): string {
    return Order.getStatusDescription(this.props.status);
  }

  static getStatusDescription(status: OrderStatus): string {
    return statusDictionary[status];
  }
}
