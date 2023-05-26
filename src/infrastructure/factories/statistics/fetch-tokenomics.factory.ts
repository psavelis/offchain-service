import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { FetchTokenomicsUseCase } from '../../../domain/statistics/usecases/fetch-tokenomics.usecase';
import { FetchTokenomicsInteractor } from '../../../domain/statistics/interactors/fetch-tokenomics.interactor';
import { FetchableKnnSummaryDbAdapter } from '../../adapters/outbound/database/statistics/fetchable-knn-summary.adapter';
import { KnexPostgresDatabase } from '../../adapters/outbound/database/knex-postgres.db';
import { FetchableLockedOrdersSummaryRpcAdapter } from '../../adapters/outbound/json-rpc/statistics/fetchable-locked-orders-summary.adapter';
import { KnnToCurrenciesFactory } from '../price/knn-to-currencies.factory';

export class FetchTokenomicsFactory {
  static instance: FetchTokenomicsInteractor;

  static getInstance(): FetchTokenomicsInteractor {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const kannaProvider = KannaProvider.getInstance(settings);

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const fetchKnnSummaryDbAdapter =
        FetchableKnnSummaryDbAdapter.getInstance(knexPostgresDb);

      const fetchLockedOrdersSumaryRpcAdapter =
        FetchableLockedOrdersSummaryRpcAdapter.getInstance(
          settings,
          kannaProvider,
        );

      const knnToCurrenciesUseCase = KnnToCurrenciesFactory.getInstance();

      this.instance = new FetchTokenomicsUseCase(
        settings,
        fetchKnnSummaryDbAdapter,
        fetchLockedOrdersSumaryRpcAdapter,
        knnToCurrenciesUseCase,
      );
    }

    return this.instance;
  }
}
