import { Controller, Inject } from '@nestjs/common';
import {
  ImportReconciledClaims,
  ImportReconciledClaimsInteractor,
} from '../../../../../../domain/transaction/interactors/import-reconciled-claims.interactor';

import {
  ImportPurchases,
  ImportPurchasesInteractor,
} from '../../../../../../domain/transaction/interactors/import-purchases.interactor';
import { CronJob } from 'cron';

let reconcileRunning = false;
const reconcileCrontab = '*/45 * * * * *';

let purchasesRunning = false;
const purchasesCrontab = '*/55 * * * * *';

@Controller('transaction')
export class TransactionController {
  constructor(
    @Inject(ImportReconciledClaims)
    readonly importReconciled: ImportReconciledClaimsInteractor,
    @Inject(ImportPurchases)
    readonly importPurchases: ImportPurchasesInteractor,
  ) {
    this.runReconcileCron();
    this.runPurchasesCron();
  }

  private runReconcileCron() {
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

  private runPurchasesCron() {
    const job = new CronJob(purchasesCrontab, () => {
      if (purchasesRunning) {
        return;
      }

      purchasesRunning = true;

      return this.importPurchases
        .execute()
        .catch((err) => {
          console.error(
            'Transaction.CronJob.Purchases',
            JSON.stringify({ msg: err.message, trace: err.stack }),
          );
        })
        .finally(() => {
          purchasesRunning = false;
        });
    });

    job.start();
  }
}
