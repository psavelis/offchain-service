import { BadgeEvent, BadgeEventType } from '../dtos/badge-event.dto';

export interface FetchableBadgeEventPort {
  fetch(
    cryptoWallet: string,
    referenceMetadataId: number,
    ...badgeEventType: BadgeEventType[]
  ): Promise<BadgeEvent[]>;
}
