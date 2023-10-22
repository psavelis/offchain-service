import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';

import { CreateQuoteFactory } from '../price/create-quote.factory';
import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import Logger from '../../adapters/outbound/log/logger';
import { CreateSignedDelegateOrderInteractor } from '../../../domain/order/interactors/create-signed-delegate-order.interactor';
import { CreateSignedDelegateOrderUseCase } from '../../../domain/order/usecases/create-signed-delegate-order.usecase';
import { FetchableNonceAndExpirationJsonRpcAdapter } from '../../adapters/outbound/json-rpc/order/fetchable-nonce-and-expiration.adapter';
import { KannaProvider } from '../../adapters/outbound/json-rpc/kanna.provider';
import { ECDSASignatureAdapter } from '../../adapters/outbound/encryption/ecdsa/ecdsa-signature.adapter';
import { KnnToCurrenciesFactory } from '../price/knn-to-currencies.factory';
import { EstimateDelegateOrderJsonRpcAdapter } from '../../adapters/outbound/json-rpc/order/estimate-delegate-order.adapter';

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
