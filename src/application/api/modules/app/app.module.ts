import {type MiddlewareConsumer, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {BackgroundAppModule} from '../../../worker/modules/app/background-app.module';
import {ExceptionMiddleware} from '../../middlewares/exception.middleware';
import {AuthModule} from '../auth/auth.module';
import {BadgeModule} from '../badge/badge.module';
import {ClearingModule} from '../clearing/clearing.module';
import {HealthcheckModule} from '../health-check/health-check.module';
import {LedgerModule} from '../ledger/ledger.module';
import {OrderModule} from '../order/order.module';
import {PriceModule} from '../price/price.module';
import {SettlementModule} from '../settlement/settlement.module';
import {StatisticsModule} from '../statistics/statistics.module';
import {SupplyModule} from '../supply/supply.module';
import {TransactionModule} from '../transaction/transaction.module';
import {ImpactfulCultivationModule} from '../upstream-domains/impactful-cultivation/impactful-cultivation.module';

import {CorrelationMiddleware} from '../../middlewares/correlation.middleware';
@Module({
  imports: [
    AuthModule,
    HealthcheckModule,
    SupplyModule,
    PriceModule,
    OrderModule,
    ClearingModule,
    SettlementModule,
    BadgeModule,
    TransactionModule,
    LedgerModule,
    StatisticsModule,
    ImpactfulCultivationModule,
    ConfigModule.forRoot(),
    BackgroundAppModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
    consumer.apply(ExceptionMiddleware).forRoutes('*');
  }
}
