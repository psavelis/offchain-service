import {type GenerateAuthChallengeInteractor} from '../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-challenge.interactor';
import {GenerateAuthChallengeUseCase} from '../../../domain/upstream-domains/identity/authentication/usecases/generate-auth-challenge.usecase';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';
import {Aes256EncryptionAdapter} from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import {ECDSASignatureAdapter} from '../../adapters/crypto/ecdsa/ecdsa-signature.adapter';
import Logger from '../../adapters/logging/logger';
import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {PersistableAuthChallengeDbAdapter} from '../../repositories/offchain/upstream-domains/identity/persistable-auth-challenge.adapter';

export class GenerateAuthChallengeFactory {
  static instance: GenerateAuthChallengeInteractor;

  static getInstance(): GenerateAuthChallengeInteractor {
    if (!GenerateAuthChallengeFactory.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const encryptionPort = Aes256EncryptionAdapter.getInstance();
      const logger = Logger.getInstance();
      const signaturePort = ECDSASignatureAdapter.getInstance(settings);

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableAuthChallengePort =
        PersistableAuthChallengeDbAdapter.getInstance(knexPostgresDb);

      GenerateAuthChallengeFactory.instance = new GenerateAuthChallengeUseCase(
        settings,
        encryptionPort,
        persistableAuthChallengePort,
        signaturePort,
        logger,
      );
    }

    return GenerateAuthChallengeFactory.instance;
  }
}
