import {type Purchase} from '../entities/purchase.entity';

export type PersistablePurchasePort = {
	create(Purchase: Purchase): Promise<void>;
};
