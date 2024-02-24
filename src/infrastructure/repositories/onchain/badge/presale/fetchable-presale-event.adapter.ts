import {
  type PreSaleEvent,
  type PreSaleEventType,
} from '../../../../../domain/upstream-domains/presale/dtos/presale-event.dto';
import {type FetchablePreSaleEventPort} from '../../../../../domain/badge/ports/presale/fetchable-presale-event.port';
import {type IKannaProtocolProvider} from '../../kanna.provider';

export class FetchablePreSaleEventJsonRpcAdapter
implements FetchablePreSaleEventPort {
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

    const filters: Array<Promise<PreSaleEvent[]>> = preSaleEventTypes.map(async (type) => {
      const f = legacyPreSale.filters[type](cryptoWallet);
      return legacyPreSale.queryFilter(f).then((events) =>
        events.map(({transactionHash}) => ({
          name: type,
          transactionHash,
        })),
      );
    });

    const events = await Promise.all(filters);

    return events.flat();
  }
}
