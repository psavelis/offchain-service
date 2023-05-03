import { OnChainUserReceipt } from '../dtos/onchain-user-receipt.dto';

export interface FetchableDelegateClaimEventPort {
  fetch(): Promise<OnChainUserReceipt[]>;
}
