import { Lock } from '../entities/lock.entity';

export interface PersistableLockPort {
  create(lock: Lock): Promise<void>;
}
