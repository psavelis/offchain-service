import { FetchBadgeEligibilityResponseDto } from '../dtos/fetch-badge-eligibility-response.dto';

export const FetchBadgeEligibility = Symbol('FETCH_BADGE_ELIGIBILITY');

export interface FetchBadgeEligibilityInteractor {
  execute(
    cryptoWallet: string,
  ): Promise<FetchBadgeEligibilityResponseDto | undefined>;
}
