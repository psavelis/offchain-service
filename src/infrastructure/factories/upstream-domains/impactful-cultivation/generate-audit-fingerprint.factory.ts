import { type GenerateFingerprintInteractor } from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-fingerprint.interactor';
import { GenerateAuditFingerprintUseCase } from '../../../../domain/upstream-domains/impactful-cultivation/usecases/generate-audit-fingerprint.usecase';
import { SettingsAdapter } from '../../../adapters/config/settings.adapter';
import { Aes256EncryptionAdapter } from '../../../adapters/crypto/aes256/aes-256-encryption.adapter';
import Logger from '../../../adapters/logging/logger';
import { KnexPostgresDatabase } from '../../../repositories/offchain/knex-postgres.db';
import { FetchableRoleDbAdapter } from '../../../repositories/offchain/upstream-domains/identity/fetchable-role.adapter';
import { PersistableRoleDbAdapter } from '../../../repositories/offchain/upstream-domains/identity/persistable-role.adapter';
import { FetchableAuditPoolStoredEventDbAdapter } from '../../../repositories/offchain/upstream-domains/impactful-cultivation/fetchable-audit-pool-stored-event.adapter';

export class GenerateAuditFingerprintFactory {
  static instance: GenerateFingerprintInteractor;

  static getInstance(): GenerateFingerprintInteractor {
    if (!GenerateAuditFingerprintFactory.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const encryptionPort = Aes256EncryptionAdapter.getInstance();
      const logger = Logger.getInstance();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

      const fetchableRolePort =
        FetchableRoleDbAdapter.getInstance(knexPostgresDb);

      const fetchableAuditPoolStoredEventPort =
        FetchableAuditPoolStoredEventDbAdapter.getInstance(knexPostgresDb);

      const persistableRolePort =
        PersistableRoleDbAdapter.getInstance(knexPostgresDb);

      GenerateAuditFingerprintFactory.instance =
        new GenerateAuditFingerprintUseCase(
          logger,
          settings,
          encryptionPort,
          fetchableRolePort,
          fetchableAuditPoolStoredEventPort,
          persistableRolePort,
        );
    }

    return GenerateAuditFingerprintFactory.instance;
  }
}
