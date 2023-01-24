import { Controller, Inject, Post } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  CreateSettlement,
  CreateSettlementInteractor,
} from '../../../../../../domain/settlement/interactors/create-settlement.interactor';

let running = false;

@Controller('settlement')
export class SettlementController {
  constructor(
    @Inject(CreateSettlement)
    readonly createSettlement: CreateSettlementInteractor,
  ) {
    const job = new CronJob('*/2 * * * * *', () => {
      if (running) {
        return;
      }

      running = true;

      return this.createSettlement
        .execute()
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(err);
          } else {
            throw err;
          }
        })
        .finally(() => {
          running = false;
        });
    });

    job.start();
  }
}
