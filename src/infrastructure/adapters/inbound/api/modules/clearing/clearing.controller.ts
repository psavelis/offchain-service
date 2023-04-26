import { Controller, Inject } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  CreateClearing,
  CreateClearingInteractor,
} from '../../../../../../domain/clearing/interactors/create-clearing.interactor';

let running = false;

@Controller('clearing')
export class ClearingController {
  constructor(
    @Inject(CreateClearing)
    readonly createClearing: CreateClearingInteractor,
  ) {
    const job = new CronJob('*/7 * * * * *', () => {
      if (running) {
        return;
      }

      running = true;

      return this.createClearing
        .execute()
        .catch((err) => {
          console.log(`[Clearing] Provider could not respond: ${err.message}`);

          if (process.env.NODE_ENV === 'development') {
            return;
          } else {
            this.checkKnownError(err);
          }
        })
        .finally(() => {
          running = false;
        });
    });

    job.start();
  }

  private checkKnownError(err: any) {
    if (
      !err?.message?.includes('ETIMEDOUT') &&
      !err?.message?.includes('ECONNREFUSED')
    ) {
      throw err;
    }
  }
}
