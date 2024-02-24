import {type Clearing} from '../entities/clearing.entity';

export type PersistableClearingPort = {
	create(entity: Clearing): Promise<Clearing>;
	update(entity: Clearing): Promise<Clearing>;
	remove(entity: Clearing): Promise<void>;
};
