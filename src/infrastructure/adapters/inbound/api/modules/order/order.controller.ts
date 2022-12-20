import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateOrderDto } from '../../../../../../domain/order/dtos/create-order.dto';
import {
  CreateOrder,
  CreateOrderInteractor,
} from '../../../../../../domain/order/interactors/create-order.interactor';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(CreateOrder)
    readonly createOrder: CreateOrderInteractor,
  ) {}

  @Post('')
  postOrder(@Body() entry: CreateOrderDto) {
    return this.createOrder.execute(entry);
  }
}
