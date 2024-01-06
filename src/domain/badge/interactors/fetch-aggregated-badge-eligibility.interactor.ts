import { FetchBadgeEligibilityResponseDto } from '../dtos/fetch-badge-eligibility-response.dto';

export const FetchAggregatedBadgeEligibility = Symbol(
  'FETCH_AGGREGATED_BADGE_ELIGIBILITY',
);

export interface FetchAggregatedBadgeEligibilityInteractor {
  executeAll(cryptoWallet: string): Promise<FetchBadgeEligibilityResponseDto[]>;
  executeSingle(
    cryptoWallet: string,
    referenceMetadataId: number,
  ): Promise<FetchBadgeEligibilityResponseDto>;
}
