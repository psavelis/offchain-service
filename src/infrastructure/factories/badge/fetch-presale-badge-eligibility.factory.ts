import { FetchPreSaleBadgeEligibilityUseCase } from '../../../domain/badge/usecases/fetch-presale-badge-eligibility.usecase';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableBadgeEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-badge-event.adapter';
import { FetchablePreSaleEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-presale-event.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';

export class FetchPreSaleBadgeEligibilityFactory {
  static instance: FetchPreSaleBadgeEligibilityUseCase;

  private constructor() {}

  static getInstance(): FetchPreSaleBadgeEligibilityUseCase {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();

      const provider = KannaProvider.getInstance(settings);

      const fetchablePreSaleEventPort =
        FetchablePreSaleEventJsonRpcAdapter.getInstance(provider);

      const fetchableBadgeEventPort =
        FetchableBadgeEventJsonRpcAdapter.getInstance(provider);

      this.instance = new FetchPreSaleBadgeEligibilityUseCase(
        settings,
        fetchablePreSaleEventPort,
        fetchableBadgeEventPort,
      );
    }

    return this.instance;
  }
}
