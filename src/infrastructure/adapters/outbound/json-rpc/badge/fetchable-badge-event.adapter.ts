import {
  BadgeEventType,
  BadgeEvent,
} from '../../../../../domain/badge/dtos/badge-event.dto';
import { FetchableBadgeEventPort } from '../../../../../domain/badge/ports/fetchable-badge-event.port';
import { IKannaProtocolProvider } from '../kanna.provider';

export class FetchableBadgeEventJsonRpcAdapter
  implements FetchableBadgeEventPort
{
  static instance: FetchableBadgeEventPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableBadgeEventJsonRpcAdapter.instance) {
      FetchableBadgeEventJsonRpcAdapter.instance =
        new FetchableBadgeEventJsonRpcAdapter(provider);
    }

    return FetchableBadgeEventJsonRpcAdapter.instance;
  }

  async fetch(
    cryptoWallet: string,
    referenceMetadataId: number,
    ...badgeEventTypes: BadgeEventType[]
  ): Promise<BadgeEvent[]> {
    const kannaBadges = await this.provider.badges();

    const filters: Promise<BadgeEvent[]>[] = badgeEventTypes.map((type) => {
      const f = kannaBadges.filters[type](cryptoWallet, referenceMetadataId);
      return kannaBadges.queryFilter(f).then((events) =>
        events.map(({ transactionHash }) => ({
          name: type,
          referenceMetadataId,
          transactionHash,
        })),
      );
    });

    const events = await Promise.all(filters);

    return events.flat();
  }
}
