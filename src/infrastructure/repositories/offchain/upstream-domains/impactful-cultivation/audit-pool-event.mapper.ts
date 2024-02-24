/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuditPoolEvent } from '../../../../../domain/upstream-domains/impactful-cultivation/entities/audit-pool-event.entity';

export const parseRow = (row: any) => {
  return new AuditPoolEvent(
    {
      userIdentifier: row.user_identifier,
      poolAddress: row.pool_address,
      transactionHash: row.transaction_hash,
      blockNumber: row.block_number,
      blockTimestamp: row.block_timestamp,
      chainId: row.chain_id,
      eventType: row.event_type,
      amountUint256: row.amount_uint256,
      amount: row.amount,
      gasUsed: row.gas_used,
      cumulativeGasUsed: row.cumulative_gas_used,
      effectiveGasPrice: row.effective_gas_price,
      stakeId: row.stake_id,
    },
    row.id,
  );
};

export const parseEntity = (auditPoolEvent: AuditPoolEvent) => {
  return {
    id: auditPoolEvent.getId(),
    user_identifier: auditPoolEvent.getUserIdentifier(),
    pool_address: auditPoolEvent.getPoolAddress(),
    transaction_hash: auditPoolEvent.getTransactionHash(),
    block_number: auditPoolEvent.getBlockNumber(),
    block_timestamp: auditPoolEvent.getBlockTimestamp(),
    chain_id: auditPoolEvent.getChainId(),
    event_type: auditPoolEvent.getEventType(),
    amount_uint256: auditPoolEvent.getAmountUint256(),
    amount: auditPoolEvent.getAmount(),
    gas_used: auditPoolEvent.getGasUsed(),
    cumulative_gas_used: auditPoolEvent.getCumulativeGasUsed(),
    effective_gas_price: auditPoolEvent.getEffectiveGasPrice(),
    stake_id: auditPoolEvent.getStakeId(),
  };
};
