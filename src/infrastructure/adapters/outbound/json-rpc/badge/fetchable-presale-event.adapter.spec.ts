import { PreSaleEventType } from '../../../../../domain/badge/dtos/presale-event.dto';
import { FetchablePreSaleEventJsonRpcAdapter } from './fetchable-presale-event.adapter';

describe('FetchablePreSaleEventJsonRpcAdapter', () => {
  it('should return presale events', async () => {
    const expected = [
      {
        transactionHash: '0x0',
        name: PreSaleEventType.CLAIM,
      },
    ];

    const provider = {
      legacyPreSale: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([
          {
            transactionHash: '0x0',
          },
        ]),
        filters: {
          Claim: jest.fn(),
          Purchase: jest.fn(),
        },
      }),
    };
    const adapter = FetchablePreSaleEventJsonRpcAdapter.getInstance(
      provider as any,
    );
    const result = await adapter.fetch('0x0', PreSaleEventType.CLAIM);

    expect(result).toEqual(expected);
  });
});
