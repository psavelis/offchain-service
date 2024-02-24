import {type Challenge} from '../../../../domain/supply/entities/challenge.entity';

export const parseEntity = (challenge: Challenge) => {
  return {
    identifier_order_id: challenge.getIdentifierOrderId(),
    client_ip: challenge.getClientIp(),
    client_agent: challenge.getClientAgent(),
    verification_hash: challenge.getVerificationHash(),
    deactivation_hash: challenge.getDeactivationHash(),
    deactivated_at: challenge.getDeactivatedAt(),
    expires_at: challenge.getExpiresAt(),
    created_at: challenge.getCreatedAt(),
  };
};
