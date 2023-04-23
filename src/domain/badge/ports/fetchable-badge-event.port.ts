import { BadgeEvent, BadgeEventType } from '../dtos/badge-event.dto';

export interface FetchableBadgeEventPort {
  fetch(
    cryptoWallet: string,
    ...badgeEventType: BadgeEventType[]
  ): Promise<BadgeEvent[]>;
}
