import { ClaimLockedSupplyDto } from '../dtos/claim-locked-supply.dto';

export const ClaimLockedSupply = Symbol('CLAIM_LOCKED_SUPPLY');

export interface ClaimLockedSupplyInteractor {
  executeChallenge(entry: ClaimLockedSupplyDto);
  validateAnswer(entry: ClaimLockedSupplyDto);
}
