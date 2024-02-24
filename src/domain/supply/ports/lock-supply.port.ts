import {type LockSupplyDto} from '../dtos/lock-supply.dto';
import {type OnChainReceipt} from '../dtos/onchain-receipt.dto';

export type LockSupplyPort = {
	lock({amount, nonce}: LockSupplyDto): Promise<OnChainReceipt>;

	verify({amount, nonce}: LockSupplyDto): Promise<void>;
};
