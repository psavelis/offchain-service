import { Module, Scope } from '@nestjs/common';
import { ImportReconciledClaimsFactory } from '../../../../../factories/transaction/import-reconciled-claims.factory';
import { ImportPurchasesFactory } from '../../../../../factories/transaction/import-purchases.factory';
import { TransactionController } from './transaction.controller';
import { Loggable } from '../../../../../../domain/common/ports/loggable.port';
import { LoggablePortFactory } from '../../../../../factories/common/loggable-port.factory';
import { ImportReconciledClaims } from '../../../../../../domain/transaction/interactors/import-reconciled-claims.interactor';
import { ImportPurchases } from 'src/domain/transaction/interactors/import-purchases.interactor';

@Module({
  controllers: [TransactionController],
  providers: [
    {
      provide: ImportReconciledClaims,
      useFactory: ImportReconciledClaimsFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: ImportPurchases,
      useFactory: ImportPurchasesFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class TransactionModule {}
