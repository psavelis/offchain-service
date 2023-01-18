import { Module, Scope } from '@nestjs/common';
import { CreateClearing } from '../../../../../../domain/clearing/interactors/create-clearing.interactor';
import { CreateClearingFactory } from '../../../../../factories/clearing/create-clearing.factory';
import { ClearingController } from './clearing.controller';

@Module({
  controllers: [ClearingController],
  providers: [
    {
      provide: CreateClearing,
      useFactory: CreateClearingFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class ClearingModule {}
