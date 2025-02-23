import {type FetchAvailableSupplyInteractor} from '../../../domain/supply/interactors/fetch-available-supply.interactor';
import {FetchAvailableSupplyUseCase} from '../../../domain/supply/usecases/fetch-available-supply.usecase';
import {KannaProvider} from '../../repositories/onchain/kanna.provider';
import {FetchAvailableSupplyAdapter} from '../../repositories/onchain/supply/fetch-available-supply.adapter';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';

export class FetchAvailableSupplyFactory {
  static instance: FetchAvailableSupplyInteractor;

  static getInstance(): FetchAvailableSupplyInteractor {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const kannaProvider = KannaProvider.getInstance(settings);

      const adapter = new FetchAvailableSupplyAdapter(kannaProvider);
      this.instance = new FetchAvailableSupplyUseCase(adapter);
    }

    return this.instance;
  }
}
