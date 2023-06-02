import { Entity, Props } from '../../common/entity';

export interface MintHistoryProps extends Props {
  referenceMetadataId: number;
  cryptoWallet: string;
  amount: number;
  valid: boolean;
  description?: string;
  clientIp?: string;
  clientAgent?: string;
  dueDate?: Date;
  chainId: number;
}

export class MintHistory extends Entity<MintHistoryProps> {
  constructor(props: MintHistoryProps, id?: string) {
    super(props, id);
  }

  get referenceMetadataId(): number {
    return this.props.referenceMetadataId;
  }

  get cryptoWallet(): string {
    return this.props.cryptoWallet;
  }

  get amount(): number {
    return this.props.amount;
  }

  get valid(): boolean {
    return this.props.valid;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get clientIp(): string | undefined {
    return this.props.clientIp;
  }

  get clientAgent(): string | undefined {
    return this.props.clientAgent;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get chainId(): number {
    return this.props.chainId;
  }
}
