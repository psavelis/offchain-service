import {type Quote} from '../entities/quote.entity';
import {type CreateQuoteDto} from '../dtos/create-quote.dto';

export const CreateQuote = Symbol('CREATE_QUOTE');

export type CreateQuoteInteractor = {
	execute(entry: CreateQuoteDto): Promise<Quote>;
};
