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

const DEFAULT_KNN_DECIMALS = 8;
const MAINNET_CHAIN_ID = 1;

export class ProcessOrderSettlementUseCase
  implements ProcessOrderSettlementInteractor
{
  constructor(
    readonly settings: Settings,
    readonly logger: LoggablePort,
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

    if (order.getIdentifierType() === 'EA') {
      this.mailer.sendMail({
        to: order.getUserIdentifier(),
        subject: 'Sua reserva de KNN foi confirmada!',
        html: this.mailer.parserTemplate(purchaseConfirmationTemplate, {
          orderNumber: params.payment.sequence,
          knnAmount,
          brlAmount: order.getTotal().toLocaleString(),
          date: order.getCreatedAt()!.toLocaleDateString('pt-br'),
          transaction: url,
        }),
      });
    }
  }
}
