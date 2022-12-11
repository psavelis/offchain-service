import { AvailableSupplyDto } from '../dtos/available-supply.dto';

export const FetchAvailableSupply = Symbol('FETCH_AVAILABLE_SUPPLY');

export interface FetchAvailableSupplyInteractor {
  fetch(): Promise<AvailableSupplyDto>;
}
