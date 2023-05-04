import { ProcessOrderSettlementInteractor } from '../interactors/process-order-settlement.interactor';
import { LoggablePort } from '../../common/ports/loggable.port';
import { Settings } from '../../common/settings';
import { OrderWithPayment } from '../../order/dtos/order-with-payment.dto';
import { DispatchSupplyInteractor } from '../../supply/interactors/dispatch-supply.interactor';
import { OrderWithReceipt } from '../../supply/dtos/order-with-receipt.dto';
import { CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { MailerPort } from '../../common/ports/mailer.port';
import purchaseConfirmationTemplate from '../../order/mails/purchase-confirmation.template';
import { formatDecimals } from '../../common/util';
import { EncryptionPort } from '../../common/ports/encryption.port';

const DEFAULT_KNN_DECIMALS = 8;
const MAINNET_CHAIN_ID = 1;

export class ProcessOrderSettlementUseCase
  implements ProcessOrderSettlementInteractor
{
  constructor(
    readonly settings: Settings,
    readonly logger: LoggablePort,
    readonly encryptionPort: EncryptionPort,
    readonly dispatchSupplyInteractor: DispatchSupplyInteractor,
    readonly createOrderTransitionInteractor: CreateOrderTransitionInteractor,
    readonly mailer: MailerPort,
  ) {}

  async execute(params: OrderWithPayment): Promise<void> {
    if (params.order.getId() !== params.payment.orderId) {
      throw new Error(
        `[process-order-settlment] abort! ${params.order.getId()} does not match ${
          params.payment.orderId
        } on Seq#${params.payment.sequence}`,
      );
    }

    const { order, receipt }: OrderWithReceipt =
      await this.dispatchSupplyInteractor.execute(params);

    if (!receipt?.transactionHash) {
      throw new Error(
        `[process-order-settlment] failed! receipt: ${JSON.stringify(receipt)}`,
      );
    }
    await this.createOrderTransitionInteractor.execute(order, {
      reason: `#${params.payment.sequence} settled from payment: ${params.payment.id} and txn: ${receipt.transactionHash}`,
    });

    if (order.getIdentifierType() === 'EA') {
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
        .decrypt(
          order.getUserIdentifier(),
          order.getId(),
          this.settings.cbc.key,
        )
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

      const url = `https://${
        receipt.chainId === MAINNET_CHAIN_ID ? '' : 'goerli.'
      }etherscan.io/tx/${receipt.transactionHash}`;

      this.mailer
        .sendMail({
          to: decryptedIdentifier,
          subject: 'Sua reserva de KNN foi confirmada!',
          html: this.mailer.parserTemplate(purchaseConfirmationTemplate, {
            orderNumber: params.payment.sequence,
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
}
