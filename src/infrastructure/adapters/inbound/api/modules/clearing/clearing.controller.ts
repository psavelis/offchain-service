import { Controller, Inject } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  CreateClearing,
  CreateClearingInteractor,
} from '../../../../../../domain/clearing/interactors/create-clearing.interactor';
import {
  Loggable,
  LoggablePort,
} from '../../../../../../domain/common/ports/loggable.port';

let running = false;

@Controller('clearing')
export class ClearingController {
  constructor(
    @Inject(CreateClearing)
    readonly createClearing: CreateClearingInteractor,
    @Inject(Loggable)
    readonly logger: LoggablePort,
  ) {
    const job = new CronJob('*/15 * * * * *', () => {
      if (running) {
        return;
      }

      running = true;

      return this.createClearing
        .execute()
        .catch((err) => {
          this.logger.debug(
            `[Clearing] Provider could not respond: ${err.message}`,
          );

          if (process.env.NODE_ENV === 'development') {
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
