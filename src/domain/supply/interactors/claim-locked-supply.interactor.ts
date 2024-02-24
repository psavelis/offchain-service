import {type ClaimLockedSupplyDto} from '../dtos/claim-locked-supply.dto';

export const ClaimLockedSupply = Symbol('CLAIM_LOCKED_SUPPLY');

export type ClaimLockedSupplyInteractor = {
	executeChallenge(entry: ClaimLockedSupplyDto);
	validateAnswer(entry: ClaimLockedSupplyDto);
};
