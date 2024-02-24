import { type FetchTokenomicsInteractor } from '../../../domain/statistics/interactors/fetch-tokenomics.interactor';
import { FetchTokenomicsUseCase } from '../../../domain/statistics/usecases/fetch-tokenomics.usecase';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';
import { KnexPostgresDatabase } from '../../repositories/offchain/knex-postgres.db';
import { FetchableKnnSummaryDbAdapter } from '../../repositories/offchain/statistics/fetchable-knn-summary.adapter';
import { KannaProvider } from '../../repositories/onchain/kanna.provider';
import { FetchableLockedOrdersSummaryRpcAdapter } from '../../repositories/onchain/statistics/fetchable-locked-orders-summary.adapter';
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
