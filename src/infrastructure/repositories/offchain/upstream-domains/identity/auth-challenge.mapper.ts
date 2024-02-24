import { AuthChallenge } from '../../../../../domain/upstream-domains/identity/authentication/entities/auth-challenge.entity';

export const parseRow = (row: any) => {
  return new AuthChallenge(
    {
      userIdentifier: row.user_identifier,
      grantType: row.grant_type,
      chainId: row.chain_id,
      payload: row.payload,
      uri: row.uri,
      nonce: row.nonce,
      scope: row.scope,
      dueDate: row.due_date,
      clientIp: row.client_ip,
      clientAgent: row.client_agent,
    },
    row.id,
  );
};

export const parseEntity = (authChallenge: AuthChallenge) => {
  return {
    id: authChallenge.getId(),
    user_identifier: authChallenge.getUserIdentifier(),
    grant_type: authChallenge.getGrantType(),
    chain_id: authChallenge.getChainId(),
    payload: authChallenge.getPayload(),
    uri: authChallenge.getUri(),
    nonce: authChallenge.getNonce(),
    scope: authChallenge.getScope(),
    due_date: authChallenge.getDueDate(),
    client_ip: authChallenge.getClientIp(),
    client_agent: authChallenge.getClientAgent(),
  };
};
