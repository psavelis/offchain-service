import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplyModule } from '../supply/supply.module';
import { SettlementModule } from '../settlement/settlement.module';
import { ClearingModule } from '../clearing/clearing.module';
import { PriceModule } from '../price/price.module';
import { HealthcheckModule } from '../healthcheck/healthcheck.module';
import { OrderModule } from '../order/order.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    HealthcheckModule,
    SupplyModule,
    PriceModule,
    OrderModule,
    ClearingModule,
    SettlementModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 25,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
