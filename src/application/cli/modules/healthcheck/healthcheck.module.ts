import {Module} from '@nestjs/common';
import {HealthcheckCommand} from './healthcheck.command';

@Module({
  providers: [HealthcheckCommand],
})
export class HealthcheckModule {}
