import { Body, Controller, Inject, Post } from '@nestjs/common';
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
    const job = new CronJob('*/7 * * * * *', () => {
      return this.createQuote.execute({
        amount: {
          unassignedNumber: '1',
          decimals: 0,
          isoCode: 'USD',
        },
        forceReload: true,
      });
    });

    job.start();
  }

  @Post('quote')
  postQuote(@Body() entry: CreateQuoteDto) {
    return this.createQuote.execute({ ...entry, forceReload: false });
  }
}
