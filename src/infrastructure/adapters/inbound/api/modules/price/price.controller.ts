import {
  Body,
  Controller,
  Inject,
  Post,
  UnprocessableEntityException,
  Req,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CronJob } from 'cron';
import { CreateQuoteDto } from '../../../../../../domain/price/dtos/create-quote.dto';
import {
  CreateQuote,
  CreateQuoteInteractor,
} from '../../../../../../domain/price/interactors/create-quote.interactor';

@Controller('price')
export class PriceController {
  constructor(
    @Inject(CreateQuote)
    readonly createQuote: CreateQuoteInteractor,
  ) {
    const job = new CronJob(process.env.QUOTE_UPDATE_CRONTAB, () => {
      return this.createQuote
        .execute({
          amount: {
            unassignedNumber: '1000',
            decimals: 0,
            isoCode: 'BRL',
          },
          forceReload: true,
        })
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(err);
          } else {
            throw err;
          }
        });
    });

    job.start();
  }

  @Post('quote')
  @Throttle(60, 60)
  postQuote(@Body() entry: CreateQuoteDto, @Req() req, @Ip() ip) {
    try {
      return this.createQuote.execute({ ...entry, forceReload: false });
    } catch (error) {
      console.log(
        `postQuote ${PriceController.name}, [${ip}@${req?.headers['user-agent']}], ${error.message}`,
      );
      throw new UnprocessableEntityException('Bad quote request');
    }
  }
}
