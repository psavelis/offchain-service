import { VerifyPreSaleMintUseCase } from '../../../domain/badge/usecases/verify-presale-mint.usecase';
import { Settings } from '../../../domain/common/settings';

import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchableBadgeEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-badge-event.adapter';
import { FetchablePreSaleEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-presale-event.adapter';
import { FetchableMintHistoryDbAdapter } from '../../adapters/outbound/database/badge/fetchable-mint-history.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { KnexPostgresDatabase } from 'src/infrastructure/adapters/outbound/database/knex-postgres.db';

export class VerifyPreSaleMintFactory {
  static instance: VerifyPreSaleMintUseCase;

  static getInstance(): VerifyPreSaleMintUseCase {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const provider = KannaProvider.getInstance(settings);

      const fetchablePreSaleEventPort =
        FetchablePreSaleEventJsonRpcAdapter.getInstance(provider);

      const fetchableBadgeEventPort =
        FetchableBadgeEventJsonRpcAdapter.getInstance(provider);

      const fetchableMintHistoryPort =
        FetchableMintHistoryDbAdapter.getInstance(knexPostgresDb);

      this.instance = new VerifyPreSaleMintUseCase(
        settings,
        fetchablePreSaleEventPort,
        fetchableBadgeEventPort,
        fetchableMintHistoryPort,
      );
    }

    return this.instance;
  }
}
