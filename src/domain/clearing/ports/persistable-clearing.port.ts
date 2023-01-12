import { Clearing } from '../entities/clearing.entity';

export interface PersistableClearingPort {
  create(entity: Clearing): Promise<Clearing>;
  update(entity: Clearing): Promise<Clearing>;
}
