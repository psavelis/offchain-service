import { Settings } from '../../../../domain/common/settings';

import { SettingsAdapter } from '../../../adapters/outbound/environment/settings.adapter';
import { KnexPostgresDatabase } from '../../../adapters/outbound/database/knex-postgres.db';

import { PersistableMintHistoryDbAdapter } from '../../../adapters/outbound/database/badge/persistable-mint-history.adapter';
import { ECDSASignatureAdapter } from '../../../adapters/outbound/encryption/ecdsa/ecdsa-signature.adapter';
import { SignaturePort } from '../../../../domain/common/ports/signature.port';

import { SignAggregatedMintUseCase } from '../../../../domain/badge/usecases/sign-aggregated-mint.usecase';

import { VerifyAggregatedBadgeMintFactory } from './verify-aggregated-badge-mint.factory';

export class SignAggregatedMintFactory {
  static instance: SignAggregatedMintUseCase;

  static getInstance(): SignAggregatedMintUseCase {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableMintHistoryPort =
        PersistableMintHistoryDbAdapter.getInstance(knexPostgresDb);

      const verifyAggregatedMintInteractor =
        VerifyAggregatedBadgeMintFactory.getInstance();

      const signaturePort: SignaturePort =
        ECDSASignatureAdapter.getInstance(settings);

      this.instance = new SignAggregatedMintUseCase(
        settings,
        verifyAggregatedMintInteractor,
        persistableMintHistoryPort,
        signaturePort,
      );
    }

    return this.instance;
  }
}
