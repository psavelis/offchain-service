import { Challenge } from '../entities/challenge.entity';

export interface FetchableChallengePort {
  fetch(verificationHash: string): Promise<Challenge | undefined>;
}
