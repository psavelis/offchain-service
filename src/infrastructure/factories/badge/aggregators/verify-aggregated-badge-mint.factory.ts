import { SettingsAdapter } from '../../../adapters/outbound/environment/settings.adapter';
import { VerifyAggregatedBadgeMintUseCase } from '../../../../domain/badge/usecases/verify-aggregated-badge-mint.usecase';
import { KnexPostgresDatabase } from '../../../adapters/outbound/database/knex-postgres.db';
import { FetchableMintHistoryDbAdapter } from '../../../adapters/outbound/database/badge/fetchable-mint-history.adapter';
import { FetchAggregatedBadgeEligibilityFactory } from './fetch-aggregated-badge-eligibility.factory';

export class VerifyAggregatedBadgeMintFactory {
  static instance: VerifyAggregatedBadgeMintUseCase;
  static getInstance() {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const FetchAggregatedBadgeEligibilityInteractor =
        FetchAggregatedBadgeEligibilityFactory.getInstance();

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const fetchableMintHistoryPort =
        FetchableMintHistoryDbAdapter.getInstance(knexPostgresDb);

      this.instance = new VerifyAggregatedBadgeMintUseCase(
        settings,
        fetchableMintHistoryPort,
        FetchAggregatedBadgeEligibilityInteractor,
      );
    }
    return this.instance;
  }
}
