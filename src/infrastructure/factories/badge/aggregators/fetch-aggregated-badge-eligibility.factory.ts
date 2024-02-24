import {FetchAuditPoolEarlyValidatorBadgeEligibilityFactory} from '../eligibility/fetch-auditpool-early-validator-badge-eligibility.factory';
import {FetchAggregatedBadgeEligibilityUseCase} from '../../../../domain/badge/usecases/fetch-aggregated-badge-eligibility.usecase';
import {FetchAuditPoolBadgeEligibilityFactory} from '../eligibility/fetch-auditpool-badge-eligibility.factory';
import {FetchPreSaleBadgeEligibilityFactory} from '../eligibility/fetch-presale-badge-eligibility.factory';
import {SettingsAdapter} from '../../../adapters//config/settings.adapter';

export class FetchAggregatedBadgeEligibilityFactory {
  static instance: FetchAggregatedBadgeEligibilityUseCase;
  static getInstance() {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const fetchAuditPoolBadgeEligibilityUseCase =
        FetchAuditPoolBadgeEligibilityFactory.getInstance();

      const fetchPreSaleBadgeEligibilityUseCase =
        FetchPreSaleBadgeEligibilityFactory.getInstance();

      const fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase =
        FetchAuditPoolEarlyValidatorBadgeEligibilityFactory.getInstance();

      this.instance = new FetchAggregatedBadgeEligibilityUseCase(
        settings,
        fetchAuditPoolBadgeEligibilityUseCase,
        fetchPreSaleBadgeEligibilityUseCase,
        fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
      );
    }

    return this.instance;
  }
}
