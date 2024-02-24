import { type Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/config/settings.adapter';

import { type LoggablePort } from '../../../domain/common/ports/loggable.port';
import { type CreateSignedDelegateOrderInteractor } from '../../../domain/order/interactors/create-signed-delegate-order.interactor';
import { CreateSignedDelegateOrderUseCase } from '../../../domain/order/usecases/create-signed-delegate-order.usecase';
import { ECDSASignatureAdapter } from '../../adapters/crypto/ecdsa/ecdsa-signature.adapter';
import Logger from '../../adapters/logging/logger';
import { KannaProvider } from '../../repositories/onchain/kanna.provider';
import { EstimateDelegateOrderJsonRpcAdapter } from '../../repositories/onchain/order/estimate-delegate-order.adapter';
import { FetchableNonceAndExpirationJsonRpcAdapter } from '../../repositories/onchain/order/fetchable-nonce-and-expiration.adapter';
import { CreateQuoteFactory } from '../price/create-quote.factory';
import { KnnToCurrenciesFactory } from '../price/knn-to-currencies.factory';

export class CreateSignedDelegateOrderFactory {
  static instance: CreateSignedDelegateOrderInteractor;

  static getInstance(): CreateSignedDelegateOrderInteractor {
    if (!this.instance) {
      const logger: LoggablePort = Logger.getInstance();
      const settings: Settings = SettingsAdapter.getInstance().getSettings();

      const creteQuoteInboundPort = CreateQuoteFactory.getInstance();

      const provider = KannaProvider.getInstance(settings);
      const fetchableNonceAndExpiration =
        FetchableNonceAndExpirationJsonRpcAdapter.getInstance(
          settings,
          provider,
        );

      const signaturePort = ECDSASignatureAdapter.getInstance(settings);

      const knnToCurrenciesUseCase = KnnToCurrenciesFactory.getInstance();

      const estimateDelegateOrderJsonRpcAdapter =
        EstimateDelegateOrderJsonRpcAdapter.getInstance(settings, provider);

      this.instance = new CreateSignedDelegateOrderUseCase(
        creteQuoteInboundPort,
        fetchableNonceAndExpiration,
        signaturePort,
        logger,
        knnToCurrenciesUseCase,
        estimateDelegateOrderJsonRpcAdapter,
      );
    }

    return this.instance;
  }
}
