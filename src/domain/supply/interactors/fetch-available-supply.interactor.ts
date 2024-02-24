import {type AvailableSupplyDto} from '../dtos/available-supply.dto';

export const FetchAvailableSupply = Symbol('FETCH_AVAILABLE_SUPPLY');

export type FetchAvailableSupplyInteractor = {
	fetch(): Promise<AvailableSupplyDto>;
};
