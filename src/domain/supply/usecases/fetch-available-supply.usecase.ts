import { AvailableSupplyDto } from '../dtos/available-supply.dto';
import { FetchAvailableSupplyInteractor } from '../interactors/fetch-available-supply.interactor';
import { FetchableSupplyPort } from '../ports/fetchable-supply.port';

export class FetchAvailableSupplyUseCase
  implements FetchAvailableSupplyInteractor
{
  constructor(readonly fetchableSupply: FetchableSupplyPort) {}

  async fetch(): Promise<AvailableSupplyDto> {
    const amountInKNN = await this.fetchableSupply.fetch();

    const response = {
      amountInKNN,
    };

    return response;
  }
}
