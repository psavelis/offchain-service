import {Module, Scope} from '@nestjs/common';
import {CreateOrder} from '../../../../domain/order/interactors/create-order.interactor';
import {FetchOrder} from '../../../../domain/order/interactors/fetch-order.interactor';
import {SendOrderReceipt} from '../../../../domain/order/interactors/send-order-receipt.interactor';
import {CreateOrderFactory} from '../../../../infrastructure/factories/order/create-order.factory';
import {FetchOrderFactory} from '../../../../infrastructure/factories/order/fetch-order.factory';
import {SendOrderReceiptFactory} from '../../../../infrastructure/factories/order/send-order-receipt.factory';
import {OrderController} from './order.controller';
import {ExpireOrders} from '../../../../domain/order/interactors/expire-orders.interactor';
import {ExpireOrdersFactory} from '../../../../infrastructure/factories/order/expire-orders.factory';
import {CreateSignedDelegateOrder} from '../../../../domain/order/interactors/create-signed-delegate-order.interactor';
import {CreateSignedDelegateOrderFactory} from '../../../../infrastructure/factories/order/create-signed-delegate-order.factory';

@Module({
  controllers: [OrderController],
  providers: [
    {
      provide: CreateOrder,
      useFactory: CreateOrderFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: FetchOrder,
      useFactory: FetchOrderFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: SendOrderReceipt,
      useFactory: SendOrderReceiptFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: ExpireOrders,
      useFactory: ExpireOrdersFactory.getInstance,
    },
    {
      provide: CreateSignedDelegateOrder,
      useFactory: CreateSignedDelegateOrderFactory.getInstance,
    },
  ],
})
export class OrderModule {}
