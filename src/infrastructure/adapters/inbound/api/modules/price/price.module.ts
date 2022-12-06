import { Module, Scope } from '@nestjs/common';
import { CreateQuote } from '../../../../../../domain/price/interactors/create-quote.interactor';
import { CreateQuoteFactory } from '../../../../../factories/price/create-quote.factory';
import { PriceController } from './price.controller';

@Module({
  controllers: [PriceController],
  providers: [
    {
      provide: CreateQuote,
      useFactory: CreateQuoteFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class PriceModule {}
