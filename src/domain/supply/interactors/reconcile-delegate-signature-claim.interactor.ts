import {type OnchainDelegateClaimEvent} from '../dtos/onchain-delegate-claim-event.dto';

export const ReconcileDelegateClaim = Symbol('RECONCILE_DELEGATE_CLAIM');

export type ReconcileDelegateSignatureClaimInteractor = {
	execute(): Promise<OnchainDelegateClaimEvent[]>;
};
