import {type Challenge} from '../entities/challenge.entity';

export type PersistableChallengePort = {
	create(challenge: Challenge): Promise<Challenge>;
	deactivate(deactivationHash: string): Promise<void>;
};
