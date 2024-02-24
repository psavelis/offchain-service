import {type Challenge} from '../entities/challenge.entity';

export type FetchableChallengePort = {
	fetch(verificationHash: string): Promise<Challenge | undefined>;
};
