import { FetchableAuditPoolEventJsonRpcAdapter } from './fetchable-auditpool-event.adapter';

import { ethers } from 'ethers';

import { AuditPoolEventType } from '../../../../../domain/upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';

describe('FetchableAuditPoolEventRpcAdapter', () => {
  it('should return audit pool events', async () => {
    const randomTxnHash = ethers.Wallet.createRandom().address;

    const newStakeEvent = {
      transactionHash: randomTxnHash,
      name: AuditPoolEventType.NEW_STAKE,
      type: AuditPoolEventType.NEW_STAKE,
      getBlock: jest.fn().mockResolvedValue({
        timestamp: 123,
      }),
    };

    const provider = {
      auditPool: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([]),
        filters: {
          Stake: jest.fn(),
        },
      }),
      polygonAuditPool: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([newStakeEvent]),
        filters: {
          [AuditPoolEventType.NEW_STAKE]: jest.fn(),
        },
      }),
    };

    const adapter = FetchableAuditPoolEventJsonRpcAdapter.getInstance(
      provider as any,
    );

    const result = await adapter.fetch(
      randomTxnHash,
      AuditPoolEventType.NEW_STAKE,
    );

    delete (newStakeEvent as any).getBlock;
    delete (newStakeEvent as any).type;

    expect(result).toEqual([{ ...newStakeEvent, blockTimestamp: 123000 }]);
  });
});
