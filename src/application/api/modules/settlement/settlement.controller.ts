import { Controller, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CronJob } from 'cron';
import {
  Loggable,
  LoggablePort,
} from '../../../../domain/common/ports/loggable.port';
import {
  CreateSettlement,
  CreateSettlementInteractor,
} from '../../../../domain/settlement/interactors/create-settlement.interactor';

let running = false;

@ApiTags('purchases')
@Controller('/purchases/settlement')
export class SettlementController {
  constructor(
    @Inject(CreateSettlement)
    readonly createSettlement: CreateSettlementInteractor,
    @Inject(Loggable)
    readonly logger: LoggablePort,
  ) {
    const job = new CronJob('*/3 * * * * *', async () => {
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
