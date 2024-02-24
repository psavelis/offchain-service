import {
  type SignaturePayload,
  type SignaturePort,
} from '../../../domain/common/ports/signature.port';
import { Chain } from '../../common/entities/chain.entity';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { LayerType } from '../../common/enums/layer-type.enum';
import { SignerType } from '../../common/enums/signer-type.enum';
import { type LoggablePort } from '../../common/ports/loggable.port';
import { type CreateQuoteDto } from '../../price/dtos/create-quote.dto';
import { type Quote } from '../../price/entities/quote.entity';
import { type CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { type KnnToCurrenciesInteractor } from '../../price/interactors/knn-to-currencies.interactor';
import { type CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import { type QuotationAggregate } from '../../price/value-objects/quotation-aggregate.value-object';
import { type CreateQuoteWithWallet } from '../dtos/create-quote-with-wallet.dto';
import { type DelegateOrderDto } from '../dtos/delegate-order.dto';
import { type EstimateDelegateOrderDto } from '../dtos/estimate-delegate-order.dto';
import { type NonceAndExpirationDto } from '../dtos/nonce-and-expiration.dto';
import { type EstimateDelegateOrderPort } from '../ports/estimate-delegate-order.port';
import { type FetchableNonceAndExpirationPort } from '../ports/fetchable-nonce-and-expiration.port';

const decimals = 8;

const buyTypeHash =
  'BuyTokens(address recipient, uint256 knnPriceInUSD, uint16 incrementalNonce, uint256 dueDate, uint256 amountInETH, uint256 amountInETH, uint256 nonce)';

const buyTypeHashL2 =
  'BuyTokens(address recipient, uint256 knnPriceInUSD, uint16 incrementalNonce, uint256 dueDate, uint256 amountInETH, uint256 amountInKNN, uint256 nonce, uint256 chainId)';

export class CreateSignedDelegateOrderUseCase {
  constructor(
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly fetchableNonceAndExpiration: FetchableNonceAndExpirationPort,
    readonly signaturePort: SignaturePort,
    readonly logger: LoggablePort,
    readonly knnToCurrenciesInteractor: KnnToCurrenciesInteractor,
    readonly estimateDelegateOrder: EstimateDelegateOrderPort,
  ) {}

  async execute(
    createQuoteWithWallet: CreateQuoteWithWallet,
  ): Promise<DelegateOrderDto> {
    this.validateEntry(createQuoteWithWallet);

    const quote: Quote = await this.createQuote(createQuoteWithWallet);

    const price = await this.getPrice();

    const chain = new Chain(createQuoteWithWallet.chainId);

    const { dueDate, incrementalNonce }: NonceAndExpirationDto =
      await this.getNonceAndExpiration(createQuoteWithWallet, chain);

    const chainIsoCode = chain.layer === LayerType.L1 ? 'ETH' : 'MATIC';

    const payload: SignaturePayload = this.getSignaturePayload(
      chain,
      createQuoteWithWallet,
      price,
      incrementalNonce,
      dueDate,
      quote.total[chainIsoCode].unassignedNumber,
      quote.total.KNN.unassignedNumber,
    );

    const { signature, nonce } = await this.signaturePort.sign(
      payload,
      SignerType.DynamicSaleClaimManager,
      chain,
    );

    const gasEstimate = String(101130);
    // await this.estimate(
    //   createQuoteWithWallet,
    //   price,
    //   incrementalNonce,
    //   dueDate,
    //   quote,
    //   nonce,
    //   signature,
    //   chain,
    // );

    const delegateOrder: DelegateOrderDto = {
      ...quote,
      price,
      gasEstimate,
      signature,
      incrementalNonce,
      dueDate,
      nonce,
    };

    this.validateResult(createQuoteWithWallet, delegateOrder);

    return delegateOrder;
  }

  validateResult(
    createQuoteWithWallet: CreateQuoteWithWallet,
    delegateOrder: DelegateOrderDto,
  ): void {
    try {
      const { isoCode, unassignedNumber } = createQuoteWithWallet.amount;

      if (delegateOrder.total[isoCode].unassignedNumber !== unassignedNumber) {
        throw new Error(
          `${isoCode} amount mismatch: ${JSON.stringify({
            delegateOrder: delegateOrder.total.KNN,
            createQuoteWithWallet,
          })}`,
        );
      }

      for (const [isoCode, amount] of Object.entries(delegateOrder.total)) {
        if (amount.decimals !== 18) {
          throw new Error(
            `${isoCode} decimals is not 18: ${JSON.stringify(amount)}`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        err,
        `${
          CreateSignedDelegateOrderUseCase.name
        }.validateResult(${JSON.stringify({
          createQuoteWithWallet,
          delegateOrder: {
            ...delegateOrder,
            signature: '[redacted]',
          },
        })}) => ${err.message} @ ${err.stack}`,
      );

      throw err;
    }
  }

  private async estimate(
    createQuoteWithWallet: CreateQuoteWithWallet,
    price: QuotationAggregate,
    incrementalNonce: string,
    dueDate: string,
    quote: Quote,
    nonce: string,
    signature: string,
    chain: Chain,
  ): Promise<string> {
    try {
      if (price.USD.decimals !== 18) {
        throw new Error(
          `${
            CreateSignedDelegateOrderUseCase.name
          }.estimate() invalid decimals at price.USD: ${JSON.stringify(
            price.USD,
          )}`,
        );
      }

      const chainIsoCode = chain.layer === LayerType.L1 ? 'ETH' : 'MATIC';

      const estimatePayload: EstimateDelegateOrderDto = {
        recipient: createQuoteWithWallet.cryptoWallet,
        knnPriceInUSD: price.USD.unassignedNumber,
        incrementalNonce,
        dueDate,
        amountInETH: quote.total[chainIsoCode].unassignedNumber,
        amountInKNN: quote.total.KNN.unassignedNumber,
        nonce,
        signature,
        chain,
      };

      const gasEstimate = await this.estimateDelegateOrder.execute(
        estimatePayload,
      );

      return gasEstimate;
    } catch (err) {
      this.logger.error(
        err,
        `${CreateSignedDelegateOrderUseCase.name}.estimate(${JSON.stringify({
          createQuoteWithWallet,
          price,
          incrementalNonce,
          dueDate,
          quote,
          nonce,
          signature: '[redacted]',
          chain,
        })}) => ${err.message} @ ${err.stack}`,
      );

      throw err;
    }
  }

  private async getNonceAndExpiration(
    createQuoteWithWallet: CreateQuoteWithWallet,
    chain: Chain,
  ): Promise<NonceAndExpirationDto> {
    try {
      return await this.fetchableNonceAndExpiration.fetch(
        createQuoteWithWallet.cryptoWallet,
        chain,
      );
    } catch (err) {
      this.logger.error(
        err,
        `${
          CreateSignedDelegateOrderUseCase.name
        }.getNonceAndExpiration(${JSON.stringify({
          createQuoteWithWallet,
          chain,
        })}) => ${err.message} @ ${err.stack}`,
      );

      throw err;
    }
  }

  private async getPrice(): Promise<QuotationAggregate> {
    try {
      return await this.knnToCurrenciesInteractor.execute(this.toKNN(1));
    } catch (err) {
      this.logger.error(
        err,
        `${CreateSignedDelegateOrderUseCase.name}.getPrice() => ${err.message} @ ${err.stack}`,
      );

      throw err;
    }
  }

  private async createQuote(
    createQuoteWithWallet: CreateQuoteWithWallet,
  ): Promise<Quote> {
    try {
      return await this.createQuoteInteractor.execute(createQuoteWithWallet);
    } catch (err) {
      this.logger.error(
        err,
        `${CreateSignedDelegateOrderUseCase.name}.createQuote(${JSON.stringify({
          createQuoteWithWallet,
        })}) => ${err.message} @ ${err.stack}`,
      );

      throw err;
    }
  }

  private getSignaturePayload(
    chain: Chain,
    createQuoteWithWallet: CreateQuoteDto & { cryptoWallet: string },
    price: QuotationAggregate,
    incrementalNonce: string,
    dueDate: string,
    amountInETH: string,
    amountInKNN: string,
  ): SignaturePayload {
    const typeHash = chain.layer === LayerType.L1 ? buyTypeHash : buyTypeHashL2;

    return {
      types: [
        'bytes32',
        'address',
        'uint256',
        'uint16',
        'uint256',
        'uint256',
        'uint256',
      ],
      values: [
        this.signaturePort.hash(typeHash),
        createQuoteWithWallet.cryptoWallet,
        price.USD.unassignedNumber,
        incrementalNonce,
        dueDate,
        amountInETH,
        amountInKNN,
      ],
    };
  }

  private toKNN(totalLocked: number): CurrencyAmount<IsoCodeType.KNN> {
    return {
      unassignedNumber: this.toUnassigned(totalLocked),
      isoCode: IsoCodeType.KNN,
      decimals,
    };
  }

  private toUnassigned(numberValue: number): string {
    return numberValue.toFixed(decimals).replace(/\D/g, '');
  }

  private validateEntry(entry: CreateQuoteWithWallet) {
    try {
      if (!entry.cryptoWallet) {
        throw new Error('missing cryptoWallet');
      }

      if (!entry.chainId) {
        throw new Error('missing chainId');
      }

      if (
        !entry.amount ||
        ![IsoCodeType.ETH, IsoCodeType.KNN].includes(
          entry.amount.isoCode as IsoCodeType,
        )
      ) {
        throw new Error('invalid amount');
      }

      if (!entry.transactionType) {
        throw new Error('missing transactionType');
      }

      if (entry.amount.decimals !== 18) {
        throw new Error(`invalid decimals: ${JSON.stringify(entry.amount)}`);
      }
    } catch (err) {
      this.logger.error(
        err,
        `${
          CreateSignedDelegateOrderUseCase.name
        }.validateEntry(${JSON.stringify(entry)}) => ${err.message} @ ${
          err.stack
        }`,
      );

      throw err;
    }
  }
}
