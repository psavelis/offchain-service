import {
  PreSaleEvent,
  PreSaleEventType,
} from '../../../../../domain/badge/dtos/presale-event.dto';
import { FetchablePreSaleEventPort } from '../../../../../domain/badge/ports/fetchable-presale-event.port';
import { IKannaProtocolProvider } from '../kanna.provider';

export class FetchablePreSaleEventJsonRpcAdapter
  implements FetchablePreSaleEventPort
{
  static instance: FetchablePreSaleEventPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchablePreSaleEventJsonRpcAdapter.instance) {
      FetchablePreSaleEventJsonRpcAdapter.instance =
        new FetchablePreSaleEventJsonRpcAdapter(provider);
    }

    return FetchablePreSaleEventJsonRpcAdapter.instance;
  }

  async fetch(
    cryptoWallet: string,
    ...preSaleEventTypes: PreSaleEventType[]
  ): Promise<PreSaleEvent[]> {
    const legacyPreSale = await this.provider.legacyPreSale();

    const filters: Promise<PreSaleEvent[]>[] = preSaleEventTypes.map((type) => {
      const f = legacyPreSale.filters[type](cryptoWallet);
      return legacyPreSale.queryFilter(f).then((events) =>
        events.map(({ transactionHash }) => ({
          name: type,
          transactionHash,
        })),
      );
    });

    const events = await Promise.all(filters);

    return events.flat();
  }
}
