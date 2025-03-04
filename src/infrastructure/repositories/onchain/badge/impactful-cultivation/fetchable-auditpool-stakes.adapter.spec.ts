import { ethers } from 'ethers';
import { IKannaProtocolProvider } from '../../kanna.provider';
import { FetchableAuditPoolStakesJsonRpcAdapter } from './fetchable-auditpool-stakes.adapter';

describe('FetchableAuditPoolStakesJsonRpcAdapter', () => {
  it('should return audit pool stakes', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    const kannaAuditPoolL2 = {
      isStaked: jest.fn().mockResolvedValue(true),
    };

    const provider = {
      polygonAuditPool: jest.fn().mockResolvedValue(kannaAuditPoolL2),
    };

    const adapter = FetchableAuditPoolStakesJsonRpcAdapter.getInstance(
      provider as unknown as IKannaProtocolProvider,
    );

    const result = await adapter.fetchStakeOf(cryptoWallet);

    expect(result).toEqual(true);
  });
});
