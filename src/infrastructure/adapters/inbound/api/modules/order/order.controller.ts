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
  CreateSignedDelegateOrder,
  CreateSignedDelegateOrderInteractor,
} from '../../../../../../domain/order/interactors/create-signed-delegate-order.interactor';

import {
  FetchOrder,
  FetchOrderInteractor,
} from '../../../../../../domain/order/interactors/fetch-order.interactor';

import {
  SendOrderReceipt,
  SendOrderReceiptInteractor,
} from '../../../../../../domain/order/interactors/send-order-receipt.interactor';
import {
  ExpireOrders,
  ExpireOrdersInteractor,
} from 'src/domain/order/interactors/expire-orders.interactor';
import { CronJob } from 'cron';
import { CreateQuoteDto } from 'src/domain/price/dtos/create-quote.dto';
import { CreateQuoteWithWallet } from 'src/domain/order/dtos/create-quote-with-wallet.dto';

let expirationRunning = false;
@Controller('order')
export class OrderController {
  constructor(
    @Inject(CreateOrder)
    readonly createOrder: CreateOrderInteractor,
    @Inject(FetchOrder)
    readonly fetchOrder: FetchOrderInteractor,
    @Inject(SendOrderReceipt)
    readonly sendOrderReceipt: SendOrderReceiptInteractor,
    @Inject(ExpireOrders)
    readonly expireOrders: ExpireOrdersInteractor,
    @Inject(CreateSignedDelegateOrder)
    readonly createSignedDelegateOrder: CreateSignedDelegateOrderInteractor,
  ) {
    const job = new CronJob('0 */15 * * * *', () => {
      if (expirationRunning) {
        return;
      }

      expirationRunning = true;

      return this.expireOrders
        .execute()
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          expirationRunning = false;
        });
    });

    job.start();
  }

  @Post('')
  @Throttle(10, 60)
  async postOrder(@Body() entry: CreateOrderDto, @Req() req, @Ip() ip) {
    const clientAgent = req?.headers['user-agent'];
    const clientIp = ip;

    try {
      throw new UnprocessableEntityException('only orders on exchange');

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
      throw new UnprocessableEntityException('order not processed');
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
        `getOrder ${OrderController.name} - ${err.message} - ${err.stack} - ${clientIp}@${clientAgent} - entry: ${id}`,
      );
      throw new NotFoundException('order not found');
    }
  }

  @Post('estimate')
  @Throttle(10, 60)
  async postDelegateOrder(
    @Body() entry: CreateQuoteWithWallet,
    @Req() req,
    @Ip() ip,
  ) {
    const clientAgent = req?.headers['user-agent'];
    const clientIp = ip;

    try {
      const res = await this.createSignedDelegateOrder.execute({
        ...entry,
        forceReload: false,
        clientAgent,
        clientIp,
      });

      return res;
    } catch (err) {
      console.error(
        `postDelegateOrder ${OrderController.name} - ${
          err.message
        } - ${clientIp}@${clientAgent} - entry: ${JSON.stringify(entry)}`,
      );
      throw new UnprocessableEntityException('delegate order not processed');
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
