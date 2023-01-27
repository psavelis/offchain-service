import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Param,
  Post,
  Req,
  Sse,
  MessageEvent,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  distinctUntilKeyChanged,
  interval,
  map,
  Observable,
  switchMap,
} from 'rxjs';
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

import {
  SendOrderReceipt,
  SendOrderReceiptInteractor,
} from '../../../../../../domain/order/interactors/send-order-receipt.interactor';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(CreateOrder)
    readonly createOrder: CreateOrderInteractor,
    @Inject(FetchOrder)
    readonly fetchOrder: FetchOrderInteractor,
    @Inject(SendOrderReceipt)
    readonly sendOrderReceipt: SendOrderReceiptInteractor,
  ) {}

  @Post('')
  @Throttle(10, 60)
  postOrder(@Body() entry: CreateOrderDto, @Req() req, @Ip() ip) {
    try {
      return this.createOrder.execute({
        ...entry,
        clientAgent: req?.headers['user-agent'],
        clientIp: ip,
      });
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  getOrder(
    @Param('id') id: string,
  ): Promise<BrazilianPixOrderDto | OrderDto | undefined> {
    try {
      return this.fetchOrder.fetch(id);
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse(':id/watch')
  watchOrder(@Param('id') id: string): Observable<MessageEvent> {
    return interval(1000 * 10).pipe(
      switchMap((_) => this.fetchOrder.fetch(id)),
      distinctUntilKeyChanged('status'),
      map((order) => ({ data: order })),
    );
  }
}
