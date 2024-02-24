import {type LockEntity} from '../entities/lock.entity';

export type PersistableLockPort = {
	create(lock: LockEntity): Promise<LockEntity>;
	update(lock: LockEntity): Promise<void>;
};
