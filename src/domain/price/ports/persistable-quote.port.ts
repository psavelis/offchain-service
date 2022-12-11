import { Quote } from '../entities/quote.entity';

export interface PersistableQuotePort {
  save(quote: Quote): Promise<Quote>;
}
