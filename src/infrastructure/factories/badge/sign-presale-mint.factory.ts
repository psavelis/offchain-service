import { SignPreSaleMintUseCase } from '../../../domain/badge/usecases/sign-presale-mint.usecase';
import { Settings } from '../../../domain/common/settings';

import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';

import { PersistableMintHistoryDbAdapter } from '../../adapters/outbound/database/badge/persistable-mint-history.adapter';
import { FetchableBadgeEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-badge-event.adapter';
import { FetchablePreSaleEventJsonRpcAdapter } from '../../adapters/outbound/json-rpc/badge/fetchable-presale-event.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { VerifyPreSaleMintUseCase } from '../../../domain/badge/usecases/verify-presale-mint.usecase';
import { ECDSASignatureAdapter } from '../../adapters/outbound/encryption/ecdsa/ecdsa-signature.adapter';
import { SignaturePort } from '../../../domain/common/ports/signature.port';

export class VerifyPreSaleMintFactory {
  static instance: SignPreSaleMintUseCase;

  static getInstance(): SignPreSaleMintUseCase {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const persistableMintHistoryPort =
        PersistableMintHistoryDbAdapter.getInstance(knexPostgresDb);

      const provider = KannaProvider.getInstance(settings);

      const fetchablePreSaleEventPort =
        FetchablePreSaleEventJsonRpcAdapter.getInstance(provider);

      const fetchableBadgeEventPort =
        FetchableBadgeEventJsonRpcAdapter.getInstance(provider);

      const verifyPreSaleMintUseCase = new VerifyPreSaleMintUseCase(
        settings,
        fetchablePreSaleEventPort,
        fetchableBadgeEventPort,
      );

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
