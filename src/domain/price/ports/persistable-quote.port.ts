import {type Quote} from '../entities/quote.entity';

export type PersistableQuotePort = {
	save(quote: Quote): Promise<Quote>;
};
