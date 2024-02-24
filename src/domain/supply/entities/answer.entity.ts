import {SequenceEntity, type Props} from '../../common/sequence-entity';

export type AnswerProps = {
	identifierOrderId: string;
	challengeId: number;
	clientIp?: string;
	clientAgent?: string;
	verificationHash: string;
	createdAt?: Date;
} & Props;

export class Answer extends SequenceEntity<AnswerProps> {
  constructor(props: AnswerProps, id?: number) {
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

  public getChallengeId() {
    return this.props.challengeId;
  }

  public getCreatedAt() {
    return this.props.createdAt;
  }
}
