import { Clearing } from '../entities/clearing.entity';

export const CreateClearing = Symbol('CREATE_CLEARING');

export interface CreateClearingInteractor {
  execute(): Promise<Clearing>;
}
