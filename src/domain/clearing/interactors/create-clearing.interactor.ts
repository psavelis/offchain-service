import {type Clearing} from '../entities/clearing.entity';

export const CreateClearing = Symbol('CREATE_CLEARING');

export type CreateClearingInteractor = {
	execute(): Promise<Clearing>;
};
