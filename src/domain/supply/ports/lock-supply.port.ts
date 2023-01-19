import { LockSupplyDto } from '../dtos/lock-supply.dto';
import { OnChainReceipt } from '../dtos/onchain-receipt.dto';

export interface LockSupplyPort {
  lock({ amount, nonce }: LockSupplyDto): Promise<OnChainReceipt>;

  verify({ amount, nonce }: LockSupplyDto): Promise<void>;
}
