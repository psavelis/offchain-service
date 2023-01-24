import { Module, Scope } from '@nestjs/common';
import { CreateSettlement } from '../../../../../../domain/settlement/interactors/create-settlement.interactor';
import { CreateSettlementFactory } from '../../../../../factories/settlement/create-settlement.factory';
import { SettlementController } from './settlement.controller';

@Module({
  controllers: [SettlementController],
  providers: [
    {
      provide: CreateSettlement,
      useFactory: CreateSettlementFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class SettlementModule {}
