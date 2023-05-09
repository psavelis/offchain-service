import { Purchase } from '../entities/purchase.entity';

export interface PersistablePurchasePort {
  create(Purchase: Purchase): Promise<void>;
}
