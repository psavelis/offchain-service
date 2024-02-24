import { Chain } from 'src/domain/common/entities/chain.entity';
import { type EncryptionPort } from '../../common/ports/encryption.port';
import { type LoggablePort } from '../../common/ports/loggable.port';
import { type MailerPort } from '../../common/ports/mailer.port';
import { type Settings } from '../../common/settings';
import { formatDecimals } from '../../common/util';
import purchaseConfirmationTemplate from '../../order/mails/purchase-confirmation.template';
import { Order } from '../entities/order.entity';
import { type SendOrderReceiptInteractor } from '../interactors/send-order-receipt.interactor';
import { type FetchableOrderPort } from '../ports/fetchable-order.port';

const DEFAULT_KNN_DECIMALS = 8;

export class SendOrderReceiptUseCase implements SendOrderReceiptInteractor {
  constructor(
    readonly settings: Settings,
    readonly fetchableOrderPort: FetchableOrderPort,
    readonly encryptionPort: EncryptionPort,
    readonly mailer: MailerPort,
    readonly logger: LoggablePort,
  ) {}

  async send(orderId: string): Promise<void> {
    const endToEndId = Order.toEndId(orderId);

    const order: Order | undefined = await this.fetchableOrderPort.fetchByEndId(
      endToEndId,
    );

    if (!order) {
      return;
    }

    if (order.getIdentifierType() !== 'EA' || !order.getLockTransactionHash()) {
      return;
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

    const decryptedIdentifier = await this.encryptionPort
      .decrypt(order.getUserIdentifier(), order.getId(), this.settings.cbc.key)
      .catch((err) => {
        this.logger.error(err, '[decrypt identifier error] email');

        return order.getUserIdentifier();
      });

    const amountOfTokens = order.getAmountOfTokens();

    const knnAmount = formatDecimals(
      amountOfTokens.unassignedNumber,
      amountOfTokens.decimals,
      {
        truncateDecimals: DEFAULT_KNN_DECIMALS,
      },
    );

    const chain = new Chain(order.getSettledChainId());

    const url = chain.getBlockExplorerUrl(order.getLockTransactionHash());

    this.mailer
      .sendMail({
        to: decryptedIdentifier,
        subject: 'Sua reserva de KNN foi confirmada!',
        html: this.mailer.parserTemplate(purchaseConfirmationTemplate, {
          orderNumber: order.getPaymentSequence(),
          knnAmount,
          brlAmount: brlFormatter.format(order.getTotal()),
          date: dateFormatter.format(order.getCreatedAt()),
          transaction: url,
        }),
      })
      .catch((err) => {
        this.logger.error(err, '[sendMail] failed');
      });
  }
}
