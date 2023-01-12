import { Module, Scope } from '@nestjs/common';
import { CreateOrder } from '../../../../../../domain/order/interactors/create-order.interactor';
import { FetchOrder } from '../../../../../../domain/order/interactors/fetch-order.interactor';
import { CreateOrderFactory } from '../../../../../factories/order/create-order.factory';
import { FetchOrderFactory } from '../../../../../factories/order/fetch-order.factory';
import { OrderController } from './order.controller';

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
  ],
})
export class OrderModule {}
