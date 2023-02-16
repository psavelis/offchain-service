import {
  Body,
  Controller,
  Inject,
  Post,
  HttpException,
  HttpStatus,
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
            unassignedNumber: '60',
            decimals: 0,
            isoCode: 'USD',
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
  @Throttle(30, 60)
  postQuote(@Body() entry: CreateQuoteDto) {
    try {
      return this.createQuote.execute({ ...entry, forceReload: false });
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
