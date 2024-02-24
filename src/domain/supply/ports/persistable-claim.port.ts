import {type Claim} from '../entities/claim.entity';

export type PersistableClaimPort = {
	create(claim: Claim): Promise<Claim>;
	update(claim: Claim): Promise<void>;
};
