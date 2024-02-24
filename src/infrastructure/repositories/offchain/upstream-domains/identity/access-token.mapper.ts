/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccessToken } from '../../../../../domain/upstream-domains/identity/authentication/entities/access-token.entity';
export const parseRow = (row: any) => {
  return new AccessToken(
    {
      challengeId: row.challenge_id,
      userIdentifier: row.user_identifier,
      grantType: row.grant_type,
      chainId: row.chain_id,
      roles: row.roles,
      scopes: row.scopes,
      dueDate: row.due_date,
      clientIp: row.client_ip,
      clientAgent: row.client_agent,
    },
    row.id,
  );
};

export const parseEntity = (accessToken: AccessToken) => {
  return {
    id: accessToken.getId(),
    challenge_id: accessToken.getChallengeId(),
    user_identifier: accessToken.getUserIdentifier(),
    grant_type: accessToken.getGrantType(),
    chain_id: accessToken.getChainId(),
    roles: accessToken.getRoles(),
    scopes: accessToken.getScopes(),
    due_date: accessToken.getDueDate(),
    client_ip: accessToken.getClientIp(),
    client_agent: accessToken.getClientAgent(),
  };
};
