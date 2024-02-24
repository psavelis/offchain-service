import {type Settings} from '../../../../domain/common/settings';

import {SettingsAdapter} from '../../../adapters//config/settings.adapter';
import {KnexPostgresDatabase} from '../../../repositories/offchain/knex-postgres.db';

import {PersistableMintHistoryDbAdapter} from '../../../repositories/offchain/badge/persistable-mint-history.adapter';
import {ECDSASignatureAdapter} from '../../../adapters//crypto/ecdsa/ecdsa-signature.adapter';
import {type SignaturePort} from '../../../../domain/common/ports/signature.port';

import {SignAggregatedMintUseCase} from '../../../../domain/badge/usecases/sign-aggregated-mint.usecase';

import {VerifyAggregatedBadgeMintFactory} from './verify-aggregated-badge-mint.factory';

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
