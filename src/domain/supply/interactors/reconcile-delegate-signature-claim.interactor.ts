import { OnchainDelegateClaimEvent } from '../dtos/onchain-delegate-claim-event.dto';

export const ReconcileDelegateClaim = Symbol('RECONCILE_DELEGATE_CLAIM');

export interface ReconcileDelegateSignatureClaimInteractor {
  execute(): Promise<OnchainDelegateClaimEvent[]>;
}
