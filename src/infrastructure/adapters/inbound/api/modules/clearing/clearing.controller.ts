import { Controller, Inject } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  CreateClearing,
  CreateClearingInteractor,
} from '../../../../../../domain/clearing/interactors/create-clearing.interactor';
import { Loggable, LoggablePort } from 'src/domain/common/ports/loggable.port';

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
          this.logger.warning(
            `[Clearing] Provider could not respond: ${err.message}`,
          );

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
      !err?.message?.includes('ECONNREFUSED') &&
      !err?.message?.includes('Unexpected end of JSON input')
    ) {
      this.logger.error(err, `[Clearing] Provider could not respond`);

      throw err;
    }
  }
}
