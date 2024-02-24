import {type AuthChallenge} from '../entities/auth-challenge.entity';

export type FetchableAuthChallengePort = {
	findByChallengeId(challengeId: string): Promise<AuthChallenge | undefined>;
};
