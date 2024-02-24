import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {HealthcheckModule} from '../healthcheck/healthcheck.module';

@Module({
  imports: [
    HealthcheckModule,
    ConfigModule.forRoot(),
  ],
})
export class CliModule {}
