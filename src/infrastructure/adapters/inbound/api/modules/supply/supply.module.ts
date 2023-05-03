import { Module, Scope } from '@nestjs/common';
import { ClaimLockedSupply } from '../../../../../../domain/supply/interactors/claim-locked-supply.interactor';
import { FetchAvailableSupply } from '../../../../../../domain/supply/interactors/fetch-available-supply.interactor';
import { FetchAvailableSupplyFactory } from '../../../../../factories/supply/fetch-available-supply.factory';
import { ClaimLockedSupplyFactory } from '../../../../../factories/supply/claim-locked-supply.factory';
import { SupplyController } from './supply.controller';
import { Loggable } from '../../../../../../domain/common/ports/loggable.port';
import { LoggablePortFactory } from '../../../../../factories/common/loggable-port.factory';

@Module({
  controllers: [SupplyController],
  providers: [
    {
      provide: FetchAvailableSupply,
      useFactory: FetchAvailableSupplyFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: ClaimLockedSupply,
      useFactory: ClaimLockedSupplyFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class SupplyModule {}
