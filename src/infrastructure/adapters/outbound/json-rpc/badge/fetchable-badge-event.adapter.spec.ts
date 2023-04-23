import { BadgeEventType } from '../../../../../domain/badge/dtos/badge-event.dto';
import { FetchableBadgeEventRpcAdapter } from './fetchable-badge-event.adapter';

describe('FetchableBadgeEventRpcAdapter', () => {
  it('should return badge events', async () => {
    const expected = [
      {
        transactionHash: '0x0',
        name: BadgeEventType.MINT,
        referenceMetadataId: 1,
      },
    ];

    const provider = {
      badges: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([
          {
            transactionHash: '0x0',
          },
        ]),
        filters: {
          Mint: jest.fn(),
        },
      }),
    };
    const adapter = FetchableBadgeEventRpcAdapter.getInstance(provider as any);
    const result = await adapter.fetch('0x0', 1, BadgeEventType.MINT);

    expect(result).toEqual(expected);
  });
});
