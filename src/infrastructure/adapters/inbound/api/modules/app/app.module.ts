import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplyModule } from '../supply/supply.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [SupplyModule, PriceModule, ConfigModule.forRoot()],
})
export class AppModule {}
