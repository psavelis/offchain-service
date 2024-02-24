import {type AccessToken} from '../entities/access-token.entity';

export type PersistableAccessTokenPort = {
	create(accessToken: AccessToken): Promise<AccessToken>;
};
