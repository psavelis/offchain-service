import {
  Controller,
  Get,
  Inject,
  Ip,
  Query,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  FetchTokenomics,
  FetchTokenomicsInteractor,
} from '../../../../domain/statistics/interactors/fetch-tokenomics.interactor';

@ApiTags('statistics')
@Controller('/statistics')
export class StatisticsController {
  constructor(
    @Inject(FetchTokenomics)
    readonly fetchTokenomics: FetchTokenomicsInteractor,
  ) {}

  @Get('token')
  @Throttle(35, 60)
  async fetchTokenomicsAction(@Req() req, @Ip() ip) {
    try {
      const res = await this.fetchTokenomics.execute();

      return res;
    } catch (err) {
      const clientAgent = req?.headers['user-agent'];
      const clientIp = ip;

      console.error(
        `tokenomics ${StatisticsController.name} - ${err.message} - ${err.stack} - ${clientIp}@${clientAgent}`,
      );
      throw new UnprocessableEntityException('Bad stats request');
    }
  }

  @Get('coinmarketcap')
  @Throttle(35, 60)
  async fetchCoinMarketCap(@Req() req, @Ip() ip, @Query('q') query: string) {
    try {
      const res = await this.fetchTokenomics.execute();

      if (query === 'totalcoins') {
        return Number(res.totalSupply);
      }

      if (query === 'circulating') {
        return Number(res.circulatingSupply);
      }

      return res;
    } catch (err) {
      const clientAgent = req?.headers['user-agent'];
      const clientIp = ip;

      console.error(
        `coinmarketcap ${StatisticsController.name} - ${err.message} - ${err.stack} - ${clientIp}@${clientAgent}`,
      );
      throw new UnprocessableEntityException('Bad stats request');
    }
  }
}
