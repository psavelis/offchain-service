import { FetchOrderInteractor } from '../interactors/fetch-order.interactor';
import { CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { GeneratePixPort, StaticPix } from '../ports/generate-pix.port';
import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderDto } from '../dtos/order.dto';
import { Settings } from '../../common/settings';
import { FetchableOrderPort } from '../ports/fetchable-order.port';
export class FetchBrazilianPixOrderUseCase implements FetchOrderInteractor {
  constructor(
    readonly settings: Settings,
    readonly createQuoteInteractor: CreateQuoteInteractor,
    readonly fetchableOrderPort: FetchableOrderPort,
    readonly generatePixPort: GeneratePixPort,
  ) {}

  async fetch(
    orderId: string,
  ): Promise<BrazilianPixOrderDto | OrderDto | undefined> {
    const endToEndId = Order.toEndId(orderId);

    const order: Order = await this.fetchableOrderPort.fetchByEndId(endToEndId);

    if (!order?.getTotal()) {
      return undefined;
    }

    const isPendingPayment =
      order.inStatus(OrderStatus.Requested) && !order.hasPayments();

    if (isPendingPayment) {
      const { payload, base64 }: StaticPix =
        await this.generatePixPort.generate(
          order.getTotal(),
          endToEndId,
          this.settings.pix.productDescription,
        );

      return {
        ...this.parseDto(order),
        payload,
        base64,
      };
    }

    return this.parseDto(order);
  }

  private parseDto(entity: Order): OrderDto {
    return {
      orderId: entity.getId(),
      status: entity.getStatusDescription(),
      total: entity.getTotal(),
    };
  }
}
