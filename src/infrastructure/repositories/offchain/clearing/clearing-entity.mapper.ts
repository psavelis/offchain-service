import {Clearing} from '../../../../domain/clearing/entities/clearing.entity';

export const parseRow = (row: any) => {
  return new Clearing(
    {
      hash: row.hash,
      target: row.target,
      offset: row.offset,
      status: row.status,
      createdAt: row.created_at,
      endedAt: row.ended_at,
      durationMs: row.duration_ms,
      totalEntries: row.total_entries,
      totalAmount: row.total_amount,
      remarks: row.remarks,
      sequence: row.sequence,
    },
    row.id,
  );
};

export const parseEntity = (clearing: Clearing) => {
  return {
    id: clearing.getId(),
    hash: clearing.getHash(),
    target: clearing.getTarget(),
    offset: clearing.getOffset(),
    status: clearing.getStatus(),
    created_at: clearing.getCreatedAt(),
    ended_at: clearing.getEndedAt(),
    duration_ms: clearing.getDurationMs(),
    total_entries: clearing.getTotalEntries(),
    total_amount: clearing.getTotalAmount(),
    remarks: clearing.getRemarks(),
    sequence: clearing.getSequence(),
  };
};
