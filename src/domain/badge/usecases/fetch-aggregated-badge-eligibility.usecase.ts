import {type FetchBadgeEligibilityResponseDto} from '../dtos/fetch-badge-eligibility-response.dto';
import {type FetchAggregatedBadgeEligibilityInteractor} from '../interactors/fetch-aggregated-badge-eligibility.interactor';
import {type FetchAuditPoolBadgeEligibilityUseCase} from './impactful-cultivation/fetch-auditpool-badge-eligibility.usecase';
import {type FetchPreSaleBadgeEligibilityUseCase} from './presale/fetch-presale-badge-eligibility.usecase';
import {type FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase} from './impactful-cultivation/fetch-auditpool-early-validator-badge-eligibility.usecase';
import {type Settings} from 'src/domain/common/settings';

export class FetchAggregatedBadgeEligibilityUseCase
implements FetchAggregatedBadgeEligibilityInteractor {
  private readonly eligibilityStrategyMap: Record<
	number,
	{
		execute(
			cryptoWallet: string,
		): Promise<FetchBadgeEligibilityResponseDto | undefined>;
	}
	>;

  constructor(
		private readonly settings: Settings,
		private readonly fetchAuditPoolBadgeEligibilityUseCase: FetchAuditPoolBadgeEligibilityUseCase,
		private readonly fetchPreSaleBadgeEligibilityUseCase: FetchPreSaleBadgeEligibilityUseCase,
		private readonly fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase: FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
  ) {
    this.eligibilityStrategyMap = {
      [this.settings.badge.presale.referenceMetadataId]:
        this.fetchPreSaleBadgeEligibilityUseCase,
      [this.settings.badge.impactfulCultivation.auditPool.referenceMetadataId]:
        this.fetchAuditPoolBadgeEligibilityUseCase,
      [this.settings.badge.impactfulCultivation.auditPoolEarlyValidator
        .referenceMetadataId]:
        this.fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
    };
  }

  async executeAll(
    cryptoWallet: string,
  ): Promise<FetchBadgeEligibilityResponseDto[]> {
    const results = await Promise.all([
      this.fetchPreSaleBadgeEligibilityUseCase.execute(cryptoWallet),
      this.fetchAuditPoolBadgeEligibilityUseCase.execute(cryptoWallet),
      this.fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase.execute(
        cryptoWallet,
      ),
    ]);

    return results.filter((r) => r);
  }

  async executeSingle(
    cryptoWallet: string,
    referenceMetadataId: number,
  ): Promise<FetchBadgeEligibilityResponseDto> {
    const result = await this.eligibilityStrategyMap[
      referenceMetadataId
    ].execute(cryptoWallet);

    return result;
  }
}
