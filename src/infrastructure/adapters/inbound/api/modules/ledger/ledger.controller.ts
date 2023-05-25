import { Controller, Inject } from '@nestjs/common';

import { CronJob } from 'cron';
import {
  SyncLedger,
  SyncLedgerInteractor,
} from '../../../../../../domain/ledger/interactors/sync-ledger.interactor';

let running = false;
const crontab = '*/45 * * * * *';

@Controller('ledger')
export class LedgerController {
  constructor(
    @Inject(SyncLedger)
    readonly syncLedger: SyncLedgerInteractor,
  ) {
    this.runSyncLedger();
  }

  private runSyncLedger() {
    const job = new CronJob(crontab, () => {
      if (running) {
        return;
      }

      running = true;

      return this.syncLedger
        .execute()
        .catch((err) => {
          console.error(
            'Ledger.CronJob.SyncLedger',
            JSON.stringify({ msg: err.message, trace: err.stack }),
          );
        })
        .finally(() => {
          running = false;
        });
    });

    job.start();
  }
}
