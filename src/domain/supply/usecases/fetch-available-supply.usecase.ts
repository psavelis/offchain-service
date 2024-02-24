import {type AvailableSupplyDto} from '../dtos/available-supply.dto';
import {type FetchAvailableSupplyInteractor} from '../interactors/fetch-available-supply.interactor';
import {type FetchableSupplyPort} from '../ports/fetchable-supply.port';

export class FetchAvailableSupplyUseCase
implements FetchAvailableSupplyInteractor {
  constructor(readonly fetchableSupply: FetchableSupplyPort) {}

  async fetch(): Promise<AvailableSupplyDto> {
    const amountInKNN = await this.fetchableSupply.fetch();

    const response = {
      amountInKNN,
    };

    return response;
  }
}
