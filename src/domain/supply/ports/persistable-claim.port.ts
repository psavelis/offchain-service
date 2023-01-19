import { Claim } from '../entities/claim.entity';

export interface PersistableClaimPort {
  create(claim: Claim): Promise<void>;
}
