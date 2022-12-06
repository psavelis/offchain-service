import { Quote } from '../entities/quote.entity';
import { CreateQuoteDto } from '../dtos/create-quote.dto';

export const CreateQuote = Symbol('CREATE_QUOTE');

export interface CreateQuoteInteractor {
  execute(entry: CreateQuoteDto): Promise<Quote>;
}
