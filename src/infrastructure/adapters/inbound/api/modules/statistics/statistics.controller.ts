import {
  Controller,
  Inject,
  Get,
  Req,
  Ip,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FetchTokenomics,
  FetchTokenomicsInteractor,
} from '../../../../../../domain/statistics/interactors/fetch-tokenomics.interactor';
import { Throttle } from '@nestjs/throttler';

@Controller('statistics')
export class StatisticsController {
  constructor(
    @Inject(FetchTokenomics)
    readonly fetchTokenomics: FetchTokenomicsInteractor,
  ) {}

  @Get('token')
  @Throttle(10, 60)
  async fetchTokenomicsAction(@Req() req, @Ip() ip) {
    try {
      const res = await this.fetchTokenomics.execute();

      return res;
    } catch (err) {
      const clientAgent = req?.headers['user-agent'];
      const clientIp = ip;

      console.error(
        `tokenomics ${StatisticsController.name} - ${err.message} - ${clientIp}@${clientAgent}`,
      );
      throw new UnprocessableEntityException('Bad stats request');
    }
  }
}
