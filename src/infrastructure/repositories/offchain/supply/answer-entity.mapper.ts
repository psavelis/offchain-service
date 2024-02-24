import {type Answer} from '../../../../domain/supply/entities/answer.entity';

export const parseEntity = (answer: Answer) => {
  return {
    identifier_order_id: answer.getIdentifierOrderId(),
    client_ip: answer.getClientIp(),
    client_agent: answer.getClientAgent(),
    verification_hash: answer.getVerificationHash(),
    challenge_id: answer.getChallengeId(),
    created_at: answer.getCreatedAt(),
  };
};
