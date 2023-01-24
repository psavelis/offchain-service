import { LockEntity } from '../entities/lock.entity';

export interface PersistableLockPort {
  create(lock: LockEntity): Promise<LockEntity>;
  update(lock: LockEntity): Promise<void>;
}
