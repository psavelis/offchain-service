import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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
    const job = new CronJob('*/8 * * * * *', () => {
      if (running) {
        return;
      }

      running = true;

      return this.createClearing
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
