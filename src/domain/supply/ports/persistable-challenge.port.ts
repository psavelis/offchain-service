import { Challenge } from '../entities/challenge.entity';

export interface PersistableChallengePort {
  create(challenge: Challenge): Promise<Challenge>;
  deactivate(deactivationHash: string): Promise<void>;
}
