import { Module, Scope } from '@nestjs/common';
import { FetchAvailableSupply } from '../../../../../../domain/supply/interactors/fetch-available-supply.interactor';
import { FetchAvailableSupplyFactory } from '../../../../../factories/supply/fetch-available-supply.factory';
import { SupplyController } from './supply.controller';

@Module({
  controllers: [SupplyController],
  providers: [
    {
      provide: FetchAvailableSupply,
      useFactory: FetchAvailableSupplyFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class SupplyModule {}
