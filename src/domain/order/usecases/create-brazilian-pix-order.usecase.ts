import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order, PaymentOption } from '../entities/order.entity';
import { CreateOrderInteractor } from '../interactors/create-order.interactor';
import { CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { PersistableOrderPort } from '../ports/persistable-order.port';
import { IsoCodes } from '../../price/value-objects/currency-amount.value-object';
import { formatDecimals } from '../../common/util';
import { Convert, Id } from '../../common/uuid';
import { GeneratePixPort } from '../ports/generate-pix.port';
import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';

const orderDescription = 'Token KNN';

export class CreateBrazilianPixOrderUseCase implements CreateOrderInteractor {
  constructor(
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly persistableOrderPort: PersistableOrderPort,
    readonly generatePixPort: GeneratePixPort,
  ) {}

  async execute({ amount }: CreateOrderDto): Promise<BrazilianPixOrderDto> {
    const orderId = Id.new();
    const endToEndId = Convert.toBase36(orderId);
    const total = Number(
      formatDecimals(amount.unassignedNumber, amount.decimals, {
        truncateDecimals: 2,
      }),
    );

    const [order, pix] = await Promise.all([
      this.persistableOrderPort.save({
        id: orderId,
        paymentOption: PaymentOption.BrazilianPix,
        isoCode: IsoCodes.BRL,
        total,
        endToEndId,
      }),
      this.generatePixPort.generate(total, endToEndId, orderDescription),
    ]);

    return {
      orderId: order.id!,
      total,
      ...pix,
    };
  }

  static validate() {
    // TODO: validar minvalue = 60$ etc
  }
}
