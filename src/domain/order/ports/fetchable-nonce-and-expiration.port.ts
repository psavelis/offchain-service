import { Chain } from '../../common/entities/chain.entity';
import { NonceAndExpirationDto } from '../dtos/nonce-and-expiration.dto';

export interface FetchableNonceAndExpirationPort {
  fetch(cryptoWallet: string, chain: Chain): Promise<NonceAndExpirationDto>;
}
