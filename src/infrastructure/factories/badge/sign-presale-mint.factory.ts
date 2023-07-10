import { SignPreSaleMintUseCase } from '../../../domain/badge/usecases/sign-presale-mint.usecase';
import { Settings } from '../../../domain/common/settings';

import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';

import { PersistableMintHistoryDbAdapter } from '../../adapters/outbound/database/badge/persistable-mint-history.adapter';
import { ECDSASignatureAdapter } from '../../adapters/outbound/encryption/ecdsa/ecdsa-signature.adapter';
import { SignaturePort } from '../../../domain/common/ports/signature.port';
import { VerifyPreSaleMintFactory } from './verify-presale-mint.factory';

export class SignPreSaleMintFactory {
  static instance: SignPreSaleMintUseCase;

  static getInstance(): SignPreSaleMintUseCase {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableMintHistoryPort =
        PersistableMintHistoryDbAdapter.getInstance(knexPostgresDb);

      const verifyPreSaleMintUseCase = VerifyPreSaleMintFactory.getInstance();

      const signaturePort: SignaturePort =
        ECDSASignatureAdapter.getInstance(settings);

      this.instance = new SignPreSaleMintUseCase(
        settings,
        verifyPreSaleMintUseCase,
        persistableMintHistoryPort,
        signaturePort,
      );
    }

    return this.instance;
  }
}
