import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  FetchAvailableSupply,
  FetchAvailableSupplyInteractor,
} from '../../../../../../domain/supply/interactors/fetch-available-supply.interactor';

@Controller('supply')
export class SupplyController {
  constructor(
    @Inject(FetchAvailableSupply)
    readonly fetchAvailableSupply: FetchAvailableSupplyInteractor,
  ) {}

  @Get()
  getAvailableSupply() {
    return this.fetchAvailableSupply.fetch();
  }
}
