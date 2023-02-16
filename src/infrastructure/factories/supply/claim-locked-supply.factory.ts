import { FetchAvailableSupplyInteractor } from '../../../domain/supply/interactors/fetch-available-supply.interactor';

import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';

import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';
import { ClaimLockedSupplyInteractor } from 'src/domain/supply/interactors/claim-locked-supply.interactor';
import { ClaimLockedSupplyUseCase } from 'src/domain/supply/usecases/claim-locked-supply.usecase';
import { LoggablePort } from 'src/domain/common/ports/loggable.port';
import { MailerPort } from 'src/domain/common/ports/mailer.port';
import Mailer from '../../adapters/outbound/smtp/mailer.adapter';
import { KnexPostgresDatabase } from 'src/infrastructure/adapters/outbound/database/knex-postgres.db';
import { FetchableOrderDbAdapter } from 'src/infrastructure/adapters/outbound/database/order/fetchable-order.adapter';
import Logger from 'src/infrastructure/adapters/outbound/log/logger';
import { ECDSASignatureAdapter } from '../../adapters/outbound/encryption/ecdsa/ecdsa-signature.adapter';
import { SignaturePort } from 'src/domain/common/ports/signature.port';
import { Aes256EncryptionAdapter } from 'src/infrastructure/adapters/outbound/encryption/aes256/aes-256-encryption.adapter';
import { DelegateClaimPort } from 'src/domain/supply/ports/delegate-claim.port';
import { DelegateClaimRpcAdapter } from '../../adapters/outbound/json-rpc/supply/delegate-claim.adapter';
import { PersistableChallengePort } from 'src/domain/supply/ports/persistable-challenge.port';
import { PersistableChallengeDbAdapter } from '../../adapters/outbound/database/supply/persistable-challenge.adapter';
import { CreateOrderTransitionInteractor } from 'src/domain/order/interactors/create-order-status-transition.interactor';
import { CreateOrderStatusTransitionUseCase } from 'src/domain/order/usecases/create-order-status-transition.usecase';
import { PersistableOrderStatusTransitionPort } from 'src/domain/order/ports/persistable-order-status-transition.port';
import { PersistableOrderStatusTransitionDbAdapter } from 'src/infrastructure/adapters/outbound/database/order/persistable-order-status-transition.adapter';
import { FetchableChallengePort } from 'src/domain/supply/ports/fetchable-challenge.port';

import { FetchableChallengeDbAdapter } from '../../adapters/outbound/database/supply/fetchable-challenge.adapter';
import { PersistableAnswerPort } from 'src/domain/supply/ports/persistable-answer.port';
import { PersistableAnswerDbAdapter } from '../../adapters/outbound/database/supply/persistable-answer.adapter';

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
