import {type BadgeEvent, type BadgeEventType} from '../dtos/badge-event.dto';

export type FetchableBadgeEventPort = {
	fetch(
		cryptoWallet: string,
		referenceMetadataId: number,
		...badgeEventType: BadgeEventType[]
	): Promise<BadgeEvent[]>;
};
