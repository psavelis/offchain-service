import { FetchPreSaleBadgeEligibilityResponseDto } from '../dtos/fetch-presale-badge-eligibility-response.dto';

export const FetchBadgeEligibility = Symbol('FETCH_BADGE_ELIGIBILITY');

export interface FetchBadgeEligibilityInteractor {
  execute(
    cryptoWallet: string,
  ): Promise<FetchPreSaleBadgeEligibilityResponseDto | undefined>;
}
