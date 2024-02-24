import {Module, Scope} from '@nestjs/common';
import {Loggable} from '../../../../domain/common/ports/loggable.port';
import {LoggablePortFactory} from '../../../../infrastructure/factories/common/loggable-port.factory';
import {SyncLedger} from '../../../../domain/ledger/interactors/sync-ledger.interactor';
import {SyncLedgerFactory} from '../../../../infrastructure/factories/ledger/sync-ledger.factory';
import {LedgerController} from './ledger.controller';

@Module({
  controllers: [LedgerController],
  providers: [
    {
      provide: SyncLedger,
      useFactory: SyncLedgerFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class LedgerModule {}
