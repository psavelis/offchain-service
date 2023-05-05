import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order, OrderStatus, PaymentOption } from '../entities/order.entity';
import { CreateOrderInteractor } from '../interactors/create-order.interactor';
import { CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { PersistableOrderPort } from '../ports/persistable-order.port';
import { EncryptionPort } from '../../common/ports/encryption.port';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';

import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';
import { cryptoWalletRegEx, formatDecimals } from '../../common/util';
import { GeneratePixPort, StaticPix } from '../ports/generate-pix.port';
import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { Settings } from '../../common/settings';
import { LoggablePort } from '../../../domain/common/ports/loggable.port';
import { LayerType } from '../../common/enums/layer-type.enum';

const DEFAULT_ORDER_MINIMUM_TOTAL = Number(process.env.MINIMUM_PRICE) || 60;

const DEFAULT_BRL_TRUNCATE_OPTIONS = {
  truncateDecimals: 2,
};

const DEFAULT_KNN_TRUNCATE_OPTIONS = {
  truncateDecimals: 8,
};

const identifiers = {
  CriptoWallet: 'CW',
  EmailAddress: 'EA',
};

const allowedIsoCodes = [
  IsoCodeType.BRL,
  IsoCodeType.ETH,
  IsoCodeType.KNN,
  IsoCodeType.USD,
];

const allowedIdentifiers = [identifiers.CriptoWallet, identifiers.EmailAddress];
export class CreateBrazilianPixOrderUseCase implements CreateOrderInteractor {
  constructor(
    readonly logger: LoggablePort,
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly persistableOrderPort: PersistableOrderPort,
    readonly generatePixPort: GeneratePixPort,
  ) {}

  async execute(request: CreateOrderDto): Promise<BrazilianPixOrderDto> {
    this.validateCurrentChain(request);

    CreateBrazilianPixOrderUseCase.validate(request);

    const quote = await this.createQuoteInteractor
      .execute({
        amount: request.amount,
        transactionType:
          request.identifierType === 'CW' ? 'Claim' : 'LockSupply',
        chainId: this.settings.blockchain.current.id,
      })
      .catch((err) => {
        this.logger.error(
          err,
          `[quote-error] Cannot place order for user ${request.clientIp}! (${request.clientAgent})]`,
        );
      });

    if (!quote) {
      return;
    }

    const total = Number(
      formatDecimals(
        quote.total.BRL.unassignedNumber,
        quote.total.BRL.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    CreateBrazilianPixOrderUseCase.validateMinimumAmount(quote.total.BRL);

    // TODO: validar supply (cachear(!))

    const totalGas = Number(
      formatDecimals(
        quote.gasAmount.BRL.unassignedNumber,
        quote.gasAmount.BRL.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    const totalNet = Number(
      formatDecimals(
        quote.netTotal.BRL.unassignedNumber,
        quote.netTotal.BRL.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    const totalKnn = Number(
      formatDecimals(
        quote.finalAmountOfTokens.unassignedNumber,
        quote.finalAmountOfTokens.decimals,
        DEFAULT_KNN_TRUNCATE_OPTIONS,
      ),
    );

    let order = new Order({
      paymentOption: PaymentOption.BrazilianPix,
      isoCode: IsoCodeType.BRL,
      total,
      userIdentifier: request.userIdentifier,
      identifierType: request.identifierType,
      amountOfTokens: quote.finalAmountOfTokens,
      clientAgent: request.clientAgent,
      clientIp: request.clientIp,
      totalGas,
      totalNet,
      totalKnn,
    });

    const encryptedIdentifier = await this.encryptionPort.encrypt(
      request.userIdentifier,
      order.getId(),
      this.settings.cbc.key,
    );

    order.setUserIdentifier(encryptedIdentifier);

    order = await this.persistableOrderPort.create(order);

    const { payload, base64 }: StaticPix = await this.generatePixPort.generate(
      order.getTotal(),
      order.getEndToEndId(),
      this.settings.pix.productDescription,
    );

    this.logger.info(
      `New Order: ${order.getEndToEndId()} ${
        OrderStatus[order.getStatus()]
      } (${order.getStatusDescription()}) expires at ${order
        .getExpiresAt()
        .toISOString()}`,
    );

    return {
      orderId: order.getId(),
      status: order.getStatus(),
      statusDescription: order.getStatusDescription(),
      total: order.getTotal(),
      expired: false,
      expiration: order.getExpiresAt(),
      identifierType: order.getIdentifierType(),
      payload,
      base64,
      lockTransactionHash: undefined,
      claimTransactionHash: undefined,
    };
  }

  private validateCurrentChain(request: CreateOrderDto) {
    if (
      request.amount.isoCode === IsoCodeType.MATIC &&
      this.settings.blockchain.current.layer !== LayerType.L2
    ) {
      throw new Error('MATIC orders not available on L1');
    }
  }

  private static validateMinimumAmount(
    amount: CurrencyAmount<CurrencyIsoCode>,
  ) {
    const truncated = Number(
      formatDecimals(
        amount.unassignedNumber,
        amount.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    if (truncated < DEFAULT_ORDER_MINIMUM_TOTAL) {
      throw new Error('amount below minimum total');
    }
  }

  static validate({ amount, userIdentifier, identifierType }: CreateOrderDto) {
    if (!allowedIdentifiers.includes(identifierType)) {
      throw new Error('invalid identifierType');
    }

    if (!allowedIsoCodes.includes(amount.isoCode as IsoCodeType)) {
      throw new Error('invalid isoCode');
    }

    if (!userIdentifier) {
      throw new Error('userIdentifier required');
    }

    if (identifiers.CriptoWallet === identifierType) {
      if (!userIdentifier.match(cryptoWalletRegEx)) {
        throw new Error('invalid wallet address');
      }
    }

    if (identifiers.EmailAddress === identifierType) {
      if (
        !userIdentifier.match(
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g,
        )
      ) {
        throw new Error('invalid email address');
      }
    }

    if (amount.isoCode === IsoCodeType.BRL) {
      CreateBrazilianPixOrderUseCase.validateMinimumAmount(amount);
    }
  }
}
