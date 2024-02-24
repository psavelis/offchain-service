import { NetworkType } from '../../common/enums/network-type.enum';

export interface ChallengeExpirationPort {
  expireAll(encryptedIdentifier: string, chainId: NetworkType): Promise<void>;
}
