import { SequenceEntity, Props } from '../../common/sequence-entity';

export interface ChallengeProps extends Props {
  identifierOrderId: string;
  clientIp?: string;
  clientAgent?: string;
  verificationHash: string;
  deactivationHash: string;
  deactivatedAt?: Date;
  expiresAt: Date;
  createdAt?: Date;
}

export class Challenge extends SequenceEntity<ChallengeProps> {
  constructor(props: ChallengeProps, id?: number) {
    super(props, id);
  }

  public getIdentifierOrderId() {
    return this.props.identifierOrderId;
  }

  public getClientIp() {
    return this.props.clientIp;
  }

  public getClientAgent() {
    return this.props.clientAgent;
  }

  public getVerificationHash() {
    return this.props.verificationHash;
  }

  public getDeactivationHash() {
    return this.props.deactivationHash;
  }

  public getDeactivatedAt() {
    return this.props.deactivatedAt;
  }

  public getExpiresAt() {
    return this.props.expiresAt;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }
}
