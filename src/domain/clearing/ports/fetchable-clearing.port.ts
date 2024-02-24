import {type Clearing} from '../entities/clearing.entity';

export type FetchableClearingPort = {
	fetchLast(): Promise<Clearing | undefined>;
};
