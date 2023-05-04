import { OnchainDelegateClaimEvent } from '../dtos/onchain-delegate-claim-event.dto';

export const ImportDelegateClaim = Symbol('IMPORT_DELEGATE_CLAIM');

export interface ImportDelegateSignatureClaimInteractor {
  execute(): Promise<OnchainDelegateClaimEvent[]>;
}
