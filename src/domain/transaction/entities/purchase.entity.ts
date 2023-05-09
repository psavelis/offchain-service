import { Props, SequenceEntity } from '../../common/sequence-entity';

export interface PurchaseProps extends Props {
  paymentDate: Date;
  totalKnn: number;

  knnPriceInUsd: number;
  totalUsd: number;
  totalGasUsd: number;

  contractAddress: string;
  network: string;
  cryptoWallet: string;
  purchaseTransactionHash: string;

  totalEth?: number;
  totalGasEth?: number;
  ethPriceInUsd?: number;
  ethereumBlockNumber?: number;

  totalMatic?: number;
  totalGasMatic?: number;
  maticPriceInUsd?: number;
  polygonBlockNumber?: number;
}

export class Purchase extends SequenceEntity<PurchaseProps> {
  constructor(props: PurchaseProps, id?: number) {
    super(props, id);

    if (id) {
      return;
    }
  }

  get id(): number {
    return this.getId();
  }

  get paymentDate(): Date {
    return this.props.paymentDate;
  }

  get totalKnn(): number {
    return this.props.totalKnn;
  }

  get knnPriceInUsd(): number {
    return this.props.knnPriceInUsd;
  }

  get totalUsd(): number {
    return this.props.totalUsd;
  }

  get totalGasUsd(): number {
    return this.props.totalGasUsd;
  }

  get contractAddress(): string {
    return this.props.contractAddress;
  }

  get network(): string {
    return this.props.network;
  }

  get cryptoWallet(): string {
    return this.props.cryptoWallet;
  }

  get purchaseTransactionHash(): string {
    return this.props.purchaseTransactionHash;
  }

  get totalEth(): number | undefined {
    return this.props.totalEth;
  }

  get totalGasEth(): number | undefined {
    return this.props.totalGasEth;
  }

  get ethPriceInUsd(): number | undefined {
    return this.props.ethPriceInUsd;
  }

  get ethereumBlockNumber(): number | undefined {
    return this.props.ethereumBlockNumber;
  }

  get totalMatic(): number | undefined {
    return this.props.totalMatic;
  }

  get totalGasMatic(): number | undefined {
    return this.props.totalGasMatic;
  }

  get maticPriceInUsd(): number | undefined {
    return this.props.maticPriceInUsd;
  }

  get polygonBlockNumber(): number | undefined {
    return this.props.polygonBlockNumber;
  }

  public toJSON(): string {
    let obj = Object.assign(this);
    let keys = Object.keys(this.constructor.prototype);
    obj.toJSON = undefined;
    return JSON.stringify(obj, keys);
  }
}
