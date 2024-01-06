import { FetchableAuditPoolStakesPort } from '../../../../../../domain/badge/ports/impactful-cultivation/fetchable-auditpool-stakes.port';
import { IKannaProtocolProvider } from '../../kanna.provider';

export class FetchableAuditPoolStakesJsonRpcAdapter
  implements FetchableAuditPoolStakesPort
{
  static instance: FetchableAuditPoolStakesPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableAuditPoolStakesJsonRpcAdapter.instance) {
      FetchableAuditPoolStakesJsonRpcAdapter.instance =
        new FetchableAuditPoolStakesJsonRpcAdapter(provider);
    }

    return FetchableAuditPoolStakesJsonRpcAdapter.instance;
  }

  async fetchStakeOf(cryptoWallet: string): Promise<boolean> {
    const kannaAuditPoolL2 = await this.provider.polygonAuditPool();

    const isStaked = await kannaAuditPoolL2.isStaked(cryptoWallet);

    return isStaked;
  }
}
