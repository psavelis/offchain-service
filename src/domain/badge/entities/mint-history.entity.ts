import { Entity, Props } from '../../common/entity';

export interface MintHistoryProps extends Props {
  referenceMetadataId: number;
  cryptoWallet: string;
  amount: number;
  valid: boolean;
  description?: string;
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

  get reason(): string | undefined {
    return this.props.description;
  }
}
