import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { BrazilianPixOrderDto } from 'src/domain/order/dtos/brazilian-pix-order.dto';
import { OrderDto } from 'src/domain/order/dtos/order.dto';
import { CreateOrderDto } from '../../../../../../domain/order/dtos/create-order.dto';
import {
  CreateOrder,
  CreateOrderInteractor,
} from '../../../../../../domain/order/interactors/create-order.interactor';

import {
  FetchOrder,
  FetchOrderInteractor,
} from '../../../../../../domain/order/interactors/fetch-order.interactor';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(CreateOrder)
    readonly createOrder: CreateOrderInteractor,
    @Inject(FetchOrder)
    readonly fetchOrder: FetchOrderInteractor,
  ) {}

  @Post('')
  postOrder(@Body() entry: CreateOrderDto, @Req() req, @Ip() ip) {
    return this.createOrder.execute({
      ...entry,
      clientAgent: req?.headers['user-agent'],
      clientIp: ip,
    });
  }

  @Get(':id')
  getOrder(
    @Param('id') id: string,
  ): Promise<BrazilianPixOrderDto | OrderDto | undefined> {
    return this.fetchOrder.fetch(id);
  }
}
