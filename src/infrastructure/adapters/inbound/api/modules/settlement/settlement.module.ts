import { Module, Scope } from '@nestjs/common';
import { CreateSettlement } from '../../../../../../domain/settlement/interactors/create-settlement.interactor';
import { CreateSettlementFactory } from '../../../../../factories/settlement/create-settlement.factory';
import { SettlementController } from './settlement.controller';
import { Loggable } from 'src/domain/common/ports/loggable.port';
import { LoggablePortFactory } from 'src/infrastructure/factories/common/loggable-port.factory';

@Module({
  controllers: [SettlementController],
  providers: [
    {
      provide: CreateSettlement,
      useFactory: CreateSettlementFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class SettlementModule {}
