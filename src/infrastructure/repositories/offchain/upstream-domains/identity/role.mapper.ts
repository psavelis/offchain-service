/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from '../../../../../domain/upstream-domains/identity/authentication/entities/role.entity';

export const parseRow = (row: any) => {
  return new Role(
    {
      fingerprint: row.fingerprint,
      userIdentifier: row.user_identifier,
      transactionHash: row.transaction_hash,
      blockNumber: row.block_number,
      sourceAddress: row.source_address,
      eventType: row.event_type,
      chainId: row.chain_id,
      roleType: row.role_type,
      expiresAt: row.expires_at,
    },
    row.id,
  );
};

export const parseEntity = (role: Role) => {
  return {
    id: role.getId(),
    fingerprint: role.getFingerprint(),
    user_identifier: role.getUserIdentifier(),
    transaction_hash: role.getTransactionHash(),
    block_number: role.getBlockNumber(),
    source_address: role.getSourceAddress(),
    event_type: role.getEventType(),
    chain_id: role.getChainId(),
    role_type: role.getRoleType(),
    expires_at: role.getExpiresAt(),
  };
};
