import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuoteDto } from '../../../../../../domain/price/dtos/create-quote.dto';
import {
  CreateQuote,
  CreateQuoteInteractor,
} from '../../../../../../domain/price/interactors/create-quote.interactor';

@Controller('price')
export class PriceController {
  constructor(
    @Inject(CreateQuote)
    readonly createQuote: CreateQuoteInteractor,
  ) {}

  // @UseGuards(AuthGuard('bearer'))
  @Post('quote')
  postQuote(@Body() entry: CreateQuoteDto) {
    return this.createQuote.execute(entry);
  }

  @Get()
  getPrice() {
    throw new Error('NOT IMPLEMENTED!');
  }
}
