import {type ExpireOrdersInteractor} from '../interactors/expire-orders.interactor';
import {type CreateOrderTransitionInteractor} from '../interactors/create-order-status-transition.interactor';
import {type FetchableOrderPort} from '../ports/fetchable-order.port';
import {type MailerPort} from '../../common/ports/mailer.port';
import {OrderStatus} from '../entities/order.entity';
import {type Settings} from '../../common/settings';
import {type EncryptionPort} from '../../common/ports/encryption.port';
import orderExpiredTemplate from '../../order/mails/order-expired.template';
import {NetworkType} from '../../common/enums/network-type.enum';
import {formatDecimals} from '../../common/util';

export class ExpireOrdersUseCase implements ExpireOrdersInteractor {
  constructor(
		readonly settings: Settings,
		readonly mailer: MailerPort,
		readonly encryptionPort: EncryptionPort,
		readonly createTransition: CreateOrderTransitionInteractor,
		readonly fetchableOrderPort: FetchableOrderPort,
  ) {}

  async execute(): Promise<void> {
    const ordersDictionary = await this.fetchableOrderPort.fetchManyByStatus(
      [OrderStatus.Requested],
      5,
    );

    if (!ordersDictionary || !Object.keys(ordersDictionary)?.length) {
      return;
    }

    const updatePromises = Object.values(ordersDictionary)
      .filter((order) => {
        const createdAt = order.getCreatedAt() ?? new Date(1970, 1, 1);

        return order.isExpired() && createdAt.getTime() + 86400000 < Date.now();
      })
      .map(async (order) => {
        order.setStatus(OrderStatus.Expired);
        await this.createTransition.execute(order, {
          reason: 'Expired by system',
        });

        return order;
      });

    const updatedOrders = await Promise.all(updatePromises);

    for (const order of updatedOrders) {
      if (order.getIdentifierType() !== 'EA') {
        continue;
      }

      const decryptedAddress = await this.encryptionPort.decrypt(
        order.getUserIdentifier(),
        order.getId(),
        this.settings.cbc.key,
      );

      if (decryptedAddress.endsWith('@kannacoin.io')) {
        continue;
      }

      const brlFormatter = Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: 'America/Sao_Paulo',
      });

      const amountOfTokens = order.getAmountOfTokens();

      const knnAmount = formatDecimals(
        amountOfTokens.unassignedNumber,
        amountOfTokens.decimals,
        {
          truncateDecimals: 4,
        },
      );

      await new Promise((resolve) => setTimeout(resolve, 1300)).then(async () =>
        this.mailer
          .sendMail({
            to: this.settings.expiration.integromatAddress,
            subject: '[Dapp] Pedido não finalizado!',
            html: this.mailer.parserTemplate(orderExpiredTemplate, {
              endToEndId: order.getEndToEndId(),
              network:
                NetworkType[order.getDesiredChainId() ?? NetworkType.Ethereum],
              knnAmount,
              gasAmount: brlFormatter.format(order.getTotalGas()),
              brlAmount: brlFormatter.format(order.getTotal()),
              date: dateFormatter.format(order.getCreatedAt()),
              email: decryptedAddress,
              clientAgent: order.getClientAgent(),
            }),
          })
          .catch((e) => {
            console.log(e); 
          }),
      );
    }
  }
}
