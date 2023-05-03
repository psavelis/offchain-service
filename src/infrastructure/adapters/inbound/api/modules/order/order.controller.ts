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
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  distinctUntilKeyChanged,
  interval,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { BrazilianPixOrderDto } from '../../../../../../domain/order/dtos/brazilian-pix-order.dto';
import { OrderDto } from '../../../../../../domain/order/dtos/order.dto';
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
  async postOrder(@Body() entry: CreateOrderDto, @Req() req, @Ip() ip) {
    const clientAgent = req?.headers['user-agent'];
    const clientIp = ip;

    try {
      const res = await this.createOrder.execute({
        ...entry,
        clientAgent,
        clientIp,
      });

      return res;
    } catch (err) {
      console.error(
        `postOrder ${OrderController.name} - ${
          err.message
        } - ${clientIp}@${clientAgent} - entry: ${JSON.stringify(entry)}`,
      );
      throw new UnprocessableEntityException('Bad order request');
    }
  }

  @Get(':id')
  @Throttle(20, 60)
  async getOrder(
    @Param('id') id: string,
    @Req() req,
    @Ip() ip,
  ): Promise<BrazilianPixOrderDto | OrderDto | undefined> {
    const clientAgent = req?.headers['user-agent'];
    const clientIp = ip;

    try {
      const res = await this.fetchOrder.fetch(id);

      return res;
    } catch (err) {
      console.error(
        `getOrder ${OrderController.name} - ${err.message} - ${clientIp}@${clientAgent} - entry: ${id}`,
      );
      throw new NotFoundException('Order not found');
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
