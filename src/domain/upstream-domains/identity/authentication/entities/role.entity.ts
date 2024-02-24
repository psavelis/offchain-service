import { Entity, type Props } from '../../../../common/entity';
import { type RoleType } from '../enums/role-type.enum';

export type RoleProps = {
  fingerprint: string;
  userIdentifier: string;
  transactionHash: string;
  blockNumber: number;
  chainId: number;
  roleType: RoleType;
  sourceAddress: string;
  eventType: string;
  expiresAt?: Date;
} & Props;

export class Role extends Entity<RoleProps> {
  getEventType() {
    return this.props.eventType;
  }

  getSourceAddress() {
    return this.props.sourceAddress;
  }

  constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  getBlockNumber(): number {
    return this.props.blockNumber;
  }

  getFingerprint(): string {
    return this.props.fingerprint;
  }

  getExpiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  getTransactionHash(): string {
    return this.props.transactionHash;
  }

  getRoleType(): RoleType {
    return this.props.roleType;
  }

  getUserIdentifier(): string {
    return this.props.userIdentifier;
  }

  getChainId() {
    return this.props.chainId;
  }
}
