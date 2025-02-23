import {Module, Scope} from '@nestjs/common';
import {CreateClearing} from '../../../../domain/clearing/interactors/create-clearing.interactor';
import {CreateClearingFactory} from '../../../../infrastructure/factories/clearing/create-clearing.factory';
import {ClearingController} from './clearing.controller';
import {Loggable} from '../../../../domain/common/ports/loggable.port';
import {LoggablePortFactory} from '../../../../infrastructure/factories/common/loggable-port.factory';

@Module({
  controllers: [ClearingController],
  providers: [
    {
      provide: CreateClearing,
      useFactory: CreateClearingFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class ClearingModule {}
