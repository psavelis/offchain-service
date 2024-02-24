import {type AuthChallenge} from '../entities/auth-challenge.entity';

export type PersistableAuthChallengePort = {
	create(authChallenge: AuthChallenge): Promise<AuthChallenge>;
};
