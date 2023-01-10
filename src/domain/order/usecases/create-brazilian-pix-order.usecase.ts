import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order, PaymentOption } from '../entities/order.entity';
import { CreateOrderInteractor } from '../interactors/create-order.interactor';
import { CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { PersistableOrderPort } from '../ports/persistable-order.port';
import { IsoCodes } from '../../price/value-objects/currency-amount.value-object';
import { formatDecimals } from '../../common/util';
import { GeneratePixPort, StaticPix } from '../ports/generate-pix.port';
import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { Settings } from '../../common/settings';

const DEFAULT_BRL_TRUNCATE_OPTIONS = {
  truncateDecimals: 2,
};

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

    const order: Order = await this.persistableOrderPort.save(
      new Order({
        paymentOption: PaymentOption.BrazilianPix,
        isoCode: IsoCodes.BRL,
        total,
        userIdentifier,
        identifierType,
        amountOfTokens: amount,
      }),
    );

    const { payload, base64 }: StaticPix = await this.generatePixPort.generate(
      order.getTotal(),
      order.getEndToEndId(),
      this.settings.pix.productDescription,
    );

    return {
      orderId: order.getId(),
      status: order.getStatusDescription(),
      total: order.getTotal(),
      payload,
      base64,
    };
  }

  static validate() {
    // TODO: validar minvalue =
    // TODO: validar identifier
    // TODO: validar isocode
    // TODO: vallidar total order.total >= 60$ etc
    // TODO: considerar validações x momento do recalculo async (ex.: pagamento identificado apos expiracao)
  }
}
