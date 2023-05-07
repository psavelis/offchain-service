import { Controller, Inject } from '@nestjs/common';
import {
  ImportReconciledClaims,
  ImportReconciledClaimsInteractor,
} from '../../../../../../domain/transaction/interactors/import-reconciled-claims.interactor';
import { CronJob } from 'cron';

let reconcileRunning = false;
const reconcileCrontab = '*/45 * * * * *';
@Controller('transaction')
export class TransactionController {
  constructor(
    @Inject(ImportReconciledClaims)
    readonly importReconciled: ImportReconciledClaimsInteractor,
  ) {
    this.runReconcile();
  }

  private runReconcile() {
    const job = new CronJob(reconcileCrontab, () => {
      if (reconcileRunning) {
        return;
      }

      reconcileRunning = true;

      return this.importReconciled
        .execute()
        .catch((err) => {
          console.error(
            'Transaction.CronJob.ImportReconciled',
            JSON.stringify({ msg: err.message, trace: err.stack }),
          );
        })
        .finally(() => {
          reconcileRunning = false;
        });
    });

    job.start();
  }
}
