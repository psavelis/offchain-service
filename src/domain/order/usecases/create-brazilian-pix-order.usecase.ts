import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order, PaymentOption } from '../entities/order.entity';
import { CreateOrderInteractor } from '../interactors/create-order.interactor';
import { CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { PersistableOrderPort } from '../ports/persistable-order.port';
import {
  CurrencyAmount,
  CurrencyIsoCode,
  IsoCodes,
} from '../../price/value-objects/currency-amount.value-object';
import { formatDecimals } from '../../common/util';
import { GeneratePixPort, StaticPix } from '../ports/generate-pix.port';
import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { Settings } from '../../common/settings';

const DEFAULT_ORDER_MINIMUM_TOTAL = 60.0;
const DEFAULT_BRL_TRUNCATE_OPTIONS = {
  truncateDecimals: 2,
};
const identifiers = {
  CriptoWallet: 'CW',
  EmailAddress: 'EA',
};

const allowedIsoCodes = [
  IsoCodes.BRL,
  IsoCodes.ETH,
  IsoCodes.KNN,
  IsoCodes.USD,
];

const allowedIdentifiers = [identifiers.CriptoWallet, identifiers.EmailAddress];
export class CreateBrazilianPixOrderUseCase implements CreateOrderInteractor {
  constructor(
    readonly settings: Settings,
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly persistableOrderPort: PersistableOrderPort,
    readonly generatePixPort: GeneratePixPort,
  ) {}

  async execute({
    amount,
    userIdentifier,
    identifierType,
    clientAgent,
    clientIp,
  }: CreateOrderDto): Promise<BrazilianPixOrderDto> {
    const quote = await this.createQuoteInteractor.execute({
      amount,
    });

    const total = Number(
      formatDecimals(
        quote.total.BRL.unassignedNumber,
        quote.total.BRL.decimals,
        DEFAULT_BRL_TRUNCATE_OPTIONS,
      ),
    );

    CreateBrazilianPixOrderUseCase.validateMinimumAmount(quote.total.BRL);

    const order: Order = await this.persistableOrderPort.create(
      new Order({
        paymentOption: PaymentOption.BrazilianPix,
        isoCode: IsoCodes.BRL,
        total,
        userIdentifier,
        identifierType,
        amountOfTokens: quote.total.KNN,
        clientAgent,
        clientIp,
      }),
    );

    const { payload, base64 }: StaticPix = await this.generatePixPort.generate(
      order.getTotal(),
      order.getEndToEndId(),
      this.settings.pix.productDescription,
    );

    return {
      orderId: order.getId(),
      status: order.getStatus(),
      statusDescription: order.getStatusDescription(),
      total: order.getTotal(),
      payload,
      base64,
    };
  }

  static validate({ amount, userIdentifier, identifierType }: CreateOrderDto) {
    if (!allowedIdentifiers.includes(identifierType)) {
      throw new Error('invalid identifierType');
    }

    if (!allowedIsoCodes.includes(amount.isoCode as IsoCodes)) {
      throw new Error('invalid isoCode');
    }

    if (identifiers.CriptoWallet === identifierType) {
      // TODO: validação de wallet válida! (apenas regex: (opcional: validar onchain?)
    }

    if (identifiers.EmailAddress === identifierType) {
      // TODO: validação de email! (apenas regex)
    }

    if (amount.isoCode === IsoCodes.BRL) {
      CreateBrazilianPixOrderUseCase.validateMinimumAmount(amount);
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
}
