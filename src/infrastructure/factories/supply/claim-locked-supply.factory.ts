import { KannaProvider } from '../../repositories/onchain/kanna.provider';

import { type LoggablePort } from '../../../domain/common/ports/loggable.port';
import { type MailerPort } from '../../../domain/common/ports/mailer.port';
import { type SignaturePort } from '../../../domain/common/ports/signature.port';
import { type CreateOrderTransitionInteractor } from '../../../domain/order/interactors/create-order-status-transition.interactor';
import { type PersistableOrderStatusTransitionPort } from '../../../domain/order/ports/persistable-order-status-transition.port';
import { CreateOrderStatusTransitionUseCase } from '../../../domain/order/usecases/create-order-status-transition.usecase';
import { type ClaimLockedSupplyInteractor } from '../../../domain/supply/interactors/claim-locked-supply.interactor';
import { type DelegateClaimPort } from '../../../domain/supply/ports/delegate-claim.port';
import { type FetchableChallengePort } from '../../../domain/supply/ports/fetchable-challenge.port';
import { type PersistableChallengePort } from '../../../domain/supply/ports/persistable-challenge.port';
import { ClaimLockedSupplyUseCase } from '../../../domain/supply/usecases/claim-locked-supply.usecase';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';
import { Aes256EncryptionAdapter } from '../../adapters/crypto/aes256/aes-256-encryption.adapter';
import { ECDSASignatureAdapter } from '../../adapters/crypto/ecdsa/ecdsa-signature.adapter';
import Logger from '../../adapters/logging/logger';
import Mailer from '../../adapters/mailing/mailer.adapter';
import { KnexPostgresDatabase } from '../../repositories/offchain/knex-postgres.db';
import { FetchableOrderDbAdapter } from '../../repositories/offchain/order/fetchable-order.adapter';
import { PersistableOrderStatusTransitionDbAdapter } from '../../repositories/offchain/order/persistable-order-status-transition.adapter';
import { PersistableChallengeDbAdapter } from '../../repositories/offchain/supply/persistable-challenge.adapter';
import { DelegateClaimRpcAdapter } from '../../repositories/onchain/supply/delegate-claim.adapter';

import { type PersistableAnswerPort } from '../../../domain/supply/ports/persistable-answer.port';
import { FetchableChallengeDbAdapter } from '../../repositories/offchain/supply/fetchable-challenge.adapter';
import { PersistableAnswerDbAdapter } from '../../repositories/offchain/supply/persistable-answer.adapter';

export class ClaimLockedSupplyFactory {
  static instance: ClaimLockedSupplyInteractor;

  static getInstance(): ClaimLockedSupplyInteractor {
    if (!this.instance) {
      const settings = SettingsAdapter.getInstance().getSettings();
      const kannaProvider = KannaProvider.getInstance(settings);

      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const fetchableOrderPort =
        FetchableOrderDbAdapter.getInstance(knexPostgresDb);

      const logger: LoggablePort = Logger.getInstance();
      const mailerPort: MailerPort = Mailer.getInstance(settings);

      const signaturePort: SignaturePort =
        ECDSASignatureAdapter.getInstance(settings);

      const encryptionPort = Aes256EncryptionAdapter.getInstance();

      const delegateClaimPort: DelegateClaimPort =
        DelegateClaimRpcAdapter.getInstance(
          kannaProvider,
          settings,
          signaturePort,
          logger,
        );
      const persistableChallengePort: PersistableChallengePort =
        PersistableChallengeDbAdapter.getInstance(knexPostgresDb);

      const persistableOrderStatusTransitionPort: PersistableOrderStatusTransitionPort =
        PersistableOrderStatusTransitionDbAdapter.getInstance(knexPostgresDb);

      const createOrderTransitionInteractor: CreateOrderTransitionInteractor =
        new CreateOrderStatusTransitionUseCase(
          persistableOrderStatusTransitionPort,
        );

      const fetchableChallengePort: FetchableChallengePort =
        FetchableChallengeDbAdapter.getInstance(knexPostgresDb);

      const persistableAnswerPort: PersistableAnswerPort =
        PersistableAnswerDbAdapter.getInstance(knexPostgresDb);

      const claimLockedSupplyUseCase: ClaimLockedSupplyInteractor =
        new ClaimLockedSupplyUseCase(
          settings,
          logger,
          signaturePort,
          fetchableOrderPort,
          encryptionPort,
          delegateClaimPort,
          persistableChallengePort,
          createOrderTransitionInteractor,
          fetchableChallengePort,
          persistableAnswerPort,
          mailerPort,
        );

      this.instance = claimLockedSupplyUseCase;
    }

    return this.instance;
  }
}
