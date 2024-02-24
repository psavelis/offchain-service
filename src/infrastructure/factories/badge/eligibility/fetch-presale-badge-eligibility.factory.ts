import {FetchPreSaleBadgeEligibilityUseCase} from '../../../../domain/badge/usecases/presale/fetch-presale-badge-eligibility.usecase';
import {SettingsAdapter} from '../../../adapters//config/settings.adapter';
import {FetchableBadgeEventJsonRpcAdapter} from '../../../repositories/onchain/badge/fetchable-badge-event.adapter';
import {FetchablePreSaleEventJsonRpcAdapter} from '../../../repositories/onchain/badge/presale/fetchable-presale-event.adapter';
import {KannaProvider} from '../../../repositories/onchain/kanna.provider';

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
