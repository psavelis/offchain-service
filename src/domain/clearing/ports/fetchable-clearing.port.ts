import { Clearing } from '../entities/clearing.entity';

export interface FetchableClearingPort {
  fetchLast(): Promise<Clearing | undefined>;
}
