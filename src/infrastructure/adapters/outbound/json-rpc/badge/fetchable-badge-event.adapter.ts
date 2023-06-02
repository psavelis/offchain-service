import {
  BadgeEventType,
  BadgeEvent,
} from '../../../../../domain/badge/dtos/badge-event.dto';
import { FetchableBadgeEventPort } from '../../../../../domain/badge/ports/fetchable-badge-event.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaBadges } from '../protocol/contracts';

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
    const kannaBadgesL1 = await this.provider.badges();
    const kannaBadgesL2 = await this.provider.polygonBadges();

    const filtersL1: Promise<BadgeEvent[]>[] = this.fetchEvents(
      badgeEventTypes,
      kannaBadgesL1,
      cryptoWallet,
      referenceMetadataId,
    );

    const filtersL2: Promise<BadgeEvent[]>[] = this.fetchEvents(
      badgeEventTypes,
      kannaBadgesL2,
      cryptoWallet,
      referenceMetadataId,
    );

    const eventsL1 = (await Promise.all(filtersL1)).flat();
    const eventsL2 = (await Promise.all(filtersL2)).flat();

    return [...eventsL1, ...eventsL2];
  }

  private fetchEvents(
    badgeEventTypes: BadgeEventType[],
    kannaBadges: KannaBadges,
    cryptoWallet: string,
    referenceMetadataId: number,
  ): Promise<BadgeEvent[]>[] {
    return badgeEventTypes.map((type) => {
      const f = kannaBadges.filters[type](cryptoWallet, referenceMetadataId);
      return kannaBadges.queryFilter(f).then((events) =>
        events.map(({ transactionHash }) => ({
          name: type,
          referenceMetadataId,
          transactionHash,
        })),
      );
    });
  }
}
