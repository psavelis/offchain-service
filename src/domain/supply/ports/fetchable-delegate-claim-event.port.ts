import {type OnChainUserReceipt} from '../dtos/onchain-user-receipt.dto';

export type FetchableDelegateClaimEventPort = {
	fetch(): Promise<OnChainUserReceipt[]>;
};
