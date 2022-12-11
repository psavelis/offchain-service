import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplyModule } from '../supply/supply.module';
import { PriceModule } from '../price/price.module';
import { HealthcheckModule } from '../healthcheck/healthcheck.module';

@Module({
  imports: [HealthcheckModule, SupplyModule, PriceModule, ConfigModule.forRoot()],
})
export class AppModule {}
