import {type Chain} from '../../common/entities/chain.entity';
import {type NonceAndExpirationDto} from '../dtos/nonce-and-expiration.dto';

export type FetchableNonceAndExpirationPort = {
	fetch(cryptoWallet: string, chain: Chain): Promise<NonceAndExpirationDto>;
};
