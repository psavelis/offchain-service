import {SequenceEntity, type Props} from '../../common/sequence-entity';

export type ReceiptProps = {
	chainId: number;
	blockNumber: number;
	transactionHash: string;
	orderId: string;
	from: string;
	to: string;
	gasUsed: number;
	cumulativeGasUsed: number;
	effectiveGasPrice: number;
	maxPriorityFeePerGas: number;
	maxFeePerGas: number;
} & Props;

export class Receipt extends SequenceEntity<ReceiptProps> {
  constructor(props: ReceiptProps) {
    super(props);
  }

  public getChainId() {
    return this.props.chainId;
  }

  public getBlockNumber() {
    return this.props.blockNumber;
  }

  public getTransactionHash() {
    return this.props.transactionHash;
  }

  public getOrderId() {
    return this.props.orderId;
  }

  public getFrom() {
    return this.props.from;
  }

  public getTo() {
    return this.props.to;
  }

  public getGasUsed() {
    return this.props.gasUsed;
  }

  public getCumulativeGasUsed() {
    return this.props.cumulativeGasUsed;
  }

  public getEffectiveGasPrice() {
    return this.props.effectiveGasPrice;
  }

  public getMaxPriorityFeePerGas() {
    return this.props.maxPriorityFeePerGas;
  }

  public getMaxFeePerGas() {
    return this.props.maxFeePerGas;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }
}
