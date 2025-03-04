import {
  Body,
  Controller,
  Inject,
  Post,
  UnprocessableEntityException,
  Req,
  Ip,
} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import {CronJob} from 'cron';
import {CreateQuoteDto} from '../../../../domain/price/dtos/create-quote.dto';
import {
  CreateQuote,
  CreateQuoteInteractor,
} from '../../../../domain/price/interactors/create-quote.interactor';
import {NetworkType} from '../../../../domain/common/enums/network-type.enum';
import {ApiTags} from '@nestjs/swagger';

let running = false;

@ApiTags('purchases')
@Controller('/purchases/price')
export class PriceController {
  constructor(
		@Inject(CreateQuote)
		readonly createQuote: CreateQuoteInteractor,
  ) {
    const job = new CronJob(process.env.QUOTE_UPDATE_CRONTAB, async () => {
      if (running) {
        return;
      }

      running = true;

      return this.createQuote
        .execute({
          amount: {
            unassignedNumber: '1000',
            decimals: 0,
            isoCode: 'BRL',
          },
          chainId: NetworkType.Ethereum,
          forceReload: true,
        })
        .catch((err) => {
          console.error(
            'Quote.CronJob',
            JSON.stringify({msg: err.message, trace: err.stack}),
          );
        })
        .finally(() => {
          running = false;
        })
        .then(async () => {
          running = true;

          return this.createQuote
            .execute({
              amount: {
                unassignedNumber: '1000',
                decimals: 0,
                isoCode: 'BRL',
              },
              chainId: NetworkType.Polygon,
              forceReload: false,
            })
            .catch((err) => {
              console.error(
                'Quote.CronJob',
                JSON.stringify({msg: err.message, trace: err.stack}),
              );
            })
            .finally(() => {
              running = false;
            });
        });
    });

    job.start();
  }

	@Post('quote')
	@Throttle(15, 60)
  async postQuote(@Body() entry: CreateQuoteDto, @Req() req, @Ip() ip) {
    try {
      const res = await this.createQuote.execute({
        ...entry,
        forceReload: false,
      });

      return res;
    } catch (err) {
      const clientAgent = req?.headers['user-agent'];
      const clientIp = ip;

      console.error(
        `postQuote ${PriceController.name} - ${
          err.message
        } - ${clientIp}@${clientAgent} - entry: ${JSON.stringify(entry)}`,
      );
      throw new UnprocessableEntityException('Bad quote request');
    }
  }
}
