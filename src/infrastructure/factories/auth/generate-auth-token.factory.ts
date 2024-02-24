import {type GenerateAuthTokenInteractor} from '../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-token.interactor';
import {GenerateAuthTokenUseCase} from '../../../domain/upstream-domains/identity/authentication/usecases/generate-auth-token.usecase';
import {FetchableAuthChallengeDbAdapter} from '../../repositories/offchain/upstream-domains/identity/fetchable-auth-challenge.adapter';
import {FetchableRoleDbAdapter} from '../../repositories/offchain/upstream-domains/identity/fetchable-role.adapter';
import {PersistableAccessTokenDbAdapter} from '../../repositories/offchain/upstream-domains/identity/persistable-access-token.adapter';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {Aes256EncryptionAdapter} from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import {ECDSASignatureAdapter} from '../../adapters/crypto/ecdsa/ecdsa-signature.adapter';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {JwtAdapter} from '../../adapters/json/jwt.adapter';
import Logger from '../../adapters/logging/logger';

export class GenerateAuthTokenFactory {
  static instance: GenerateAuthTokenInteractor;

  static getInstance(): GenerateAuthTokenInteractor {
    if (!GenerateAuthTokenFactory.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const encryptionPort = Aes256EncryptionAdapter.getInstance();
      const logger = Logger.getInstance();
      const signaturePort = ECDSASignatureAdapter.getInstance(settings);
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const fetchableAuthChallengePort =
        FetchableAuthChallengeDbAdapter.getInstance(knexPostgresDb);
      const persistableAccessTokenPort =
        PersistableAccessTokenDbAdapter.getInstance(knexPostgresDb);

      const fetchableRolePort =
        FetchableRoleDbAdapter.getInstance(knexPostgresDb);

      const jwtPort = JwtAdapter.getInstance(settings, encryptionPort);

      GenerateAuthTokenFactory.instance = new GenerateAuthTokenUseCase(
        settings,
        encryptionPort,
        fetchableAuthChallengePort,
        signaturePort,
        persistableAccessTokenPort,
        fetchableRolePort,
        jwtPort,
        logger,
      );
    }

    return GenerateAuthTokenFactory.instance;
  }
}
