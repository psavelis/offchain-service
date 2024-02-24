import {type KnnToCurrenciesInteractor} from '../../../domain/price/interactors/knn-to-currencies.interactor';
import {type CreateQuoteUseCase} from '../../../domain/price/usecases/create-quote.usecase';
import {KnnToCurrenciesUseCase} from '../../../domain/price/usecases/knn-to-currencies.usecase';
import {CreateQuoteFactory} from './create-quote.factory';

export class KnnToCurrenciesFactory {
  static instance: KnnToCurrenciesInteractor;

  static getInstance(): KnnToCurrenciesInteractor {
    if (!this.instance) {
      const createQuoteUseCase: CreateQuoteUseCase =
        CreateQuoteFactory.getInstance() as CreateQuoteUseCase;

      this.instance = new KnnToCurrenciesUseCase(createQuoteUseCase);
    }

    return this.instance;
  }
}
