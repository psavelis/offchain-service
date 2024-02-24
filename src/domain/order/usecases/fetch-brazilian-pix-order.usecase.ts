import { type Settings } from '../../common/settings';
import { type CreateQuoteInteractor } from '../../price/interactors/create-quote.interactor';
import { type BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { type OrderDto } from '../dtos/order.dto';
import { Order, OrderStatus } from '../entities/order.entity';
import { type FetchOrderInteractor } from '../interactors/fetch-order.interactor';
import { type FetchableOrderPort } from '../ports/fetchable-order.port';
import {
  type GeneratePixPort,
  type StaticPix,
} from '../ports/generate-pix.port';
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

    const order: Order | undefined = await this.fetchableOrderPort.fetchByEndId(
      endToEndId,
    );

    if (!order?.getTotal()) {
      return undefined;
    }

    const isPendingPayment =
      order.inStatus(OrderStatus.Requested) && !order.hasPayments();

    if (isPendingPayment && !order.isExpired()) {
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
      status: entity.getStatus(),
      statusDescription: entity.getStatusDescription(),
      expired: entity.isExpired(),
      total: entity.getTotal(),
      expiration: entity.getExpiresAt(),
      identifierType: entity.getIdentifierType(),
      lockTransactionHash: entity.getLockTransactionHash(),
      claimTransactionHash: entity.getClaimTransactionHash(),
      chainId: entity.getDesiredChainId(),
    };
  }
}
