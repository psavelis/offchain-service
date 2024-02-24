import { ethers } from 'ethers';
import { PreSaleEventType } from '../../../../../domain/upstream-domains/presale/dtos/presale-event.dto';
import { IKannaProtocolProvider } from '../../kanna.provider';
import { FetchablePreSaleEventJsonRpcAdapter } from './fetchable-presale-event.adapter';

describe('FetchablePreSaleEventJsonRpcAdapter', () => {
  it('should return presale events', async () => {
    const randomWallet = ethers.Wallet.createRandom().address;

    const expected = [
      {
        transactionHash: randomWallet,
        name: PreSaleEventType.CLAIM,
      },
    ];

    const provider = {
      legacyPreSale: jest.fn().mockReturnValue({
        queryFilter: jest.fn().mockResolvedValue([
          {
            transactionHash: randomWallet,
          },
        ]),
        filters: {
          Claim: jest.fn(),
          Purchase: jest.fn(),
        },
      }),
    };
    const adapter = FetchablePreSaleEventJsonRpcAdapter.getInstance(
      provider as unknown as IKannaProtocolProvider,
    );
    const result = await adapter.fetch(randomWallet, PreSaleEventType.CLAIM);

    expect(result).toEqual(expected);
  });
});
