import { CreateQuoteDto } from '../../price/dtos/create-quote.dto';

export type CreateQuoteWithWallet = CreateQuoteDto & {
  cryptoWallet: string;
  clientAgent?: string;
  clientIp?: string;
};
