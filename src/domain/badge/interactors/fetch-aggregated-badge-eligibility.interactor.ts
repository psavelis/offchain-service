import {type FetchBadgeEligibilityResponseDto} from '../dtos/fetch-badge-eligibility-response.dto';

export const FetchAggregatedBadgeEligibility = Symbol(
  'FETCH_AGGREGATED_BADGE_ELIGIBILITY',
);

export type FetchAggregatedBadgeEligibilityInteractor = {
	executeAll(cryptoWallet: string): Promise<FetchBadgeEligibilityResponseDto[]>;
	executeSingle(
		cryptoWallet: string,
		referenceMetadataId: number,
	): Promise<FetchBadgeEligibilityResponseDto>;
};
