import { Controller, Inject, Post } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  CreateSettlement,
  CreateSettlementInteractor,
} from '../../../../../../domain/settlement/interactors/create-settlement.interactor';
import {
  Loggable,
  LoggablePort,
} from '../../../../../../domain/common/ports/loggable.port';

let running = false;

@Controller('settlement')
export class SettlementController {
  constructor(
    @Inject(CreateSettlement)
    readonly createSettlement: CreateSettlementInteractor,
    @Inject(Loggable)
    readonly logger: LoggablePort,
  ) {
    const job = new CronJob('*/3 * * * * *', () => {
      if (running) {
        return;
      }

      running = true;

      return this.createSettlement
        .execute()
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            this.logger.error(err, SettlementController.name);
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
