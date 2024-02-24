import { BadgeEventType } from '../../../../domain/badge/dtos/badge-event.dto';
import { IKannaProtocolProvider } from '../kanna.provider';
import { FetchableBadgeEventJsonRpcAdapter } from './fetchable-badge-event.adapter';

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
      polygonBadges: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([]),
        filters: {
          Mint: jest.fn(),
        },
      }),
    };

    const adapter = FetchableBadgeEventJsonRpcAdapter.getInstance(
      provider as unknown as IKannaProtocolProvider,
    );
    const result = await adapter.fetch('0x0', 1, BadgeEventType.MINT);

    expect(result).toEqual(expected);
  });
});
