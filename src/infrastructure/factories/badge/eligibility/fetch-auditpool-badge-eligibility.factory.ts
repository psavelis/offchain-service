import {FetchAuditPoolBadgeEligibilityUseCase} from '../../../../domain/badge/usecases/impactful-cultivation/fetch-auditpool-badge-eligibility.usecase';
import {SettingsAdapter} from '../../../adapters//config/settings.adapter';
import {FetchableBadgeEventJsonRpcAdapter} from '../../../repositories/onchain/badge/fetchable-badge-event.adapter';
import {FetchableAuditPoolEventJsonRpcAdapter} from '../../../repositories/onchain/badge/impactful-cultivation/fetchable-auditpool-event.adapter';
import {FetchableAuditPoolStakesJsonRpcAdapter} from '../../../repositories/onchain/badge/impactful-cultivation/fetchable-auditpool-stakes.adapter';
import {KannaProvider} from '../../../repositories/onchain/kanna.provider';

export class FetchAuditPoolBadgeEligibilityFactory {
  static instance: FetchAuditPoolBadgeEligibilityUseCase;

  private constructor() {}

  static getInstance(): FetchAuditPoolBadgeEligibilityUseCase {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();

      const provider = KannaProvider.getInstance(settings);

      const fetchableAuditPoolEventPort =
        FetchableAuditPoolEventJsonRpcAdapter.getInstance(provider);
      const fetchableAuditPoolStakesPort =
        FetchableAuditPoolStakesJsonRpcAdapter.getInstance(provider);

      const fetchableBadgeEventPort =
        FetchableBadgeEventJsonRpcAdapter.getInstance(provider);

      this.instance = new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );
    }

    return this.instance;
  }
}
