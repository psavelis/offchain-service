import { Knex } from 'knex';
import { Quote } from '../../../../../domain/price/entities/quote.entity';
import { PersistableQuotePort } from '../../../../../domain/price/ports/persistable-quote.port';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';

export interface FlattenedQuote {
  id: string;
  json: string;

  amountOfTokens: number;
  totalPerToken: number;
  netTotal: number;
  gasAmount: number;
  grossTotal: number;
  gatewayAmount: number;
  total: number;
}

export class PersistableQuoteDbAdapter implements PersistableQuotePort {
  static instance: PersistableQuoteDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableQuotePort {
    if (!PersistableQuoteDbAdapter.instance) {
      PersistableQuoteDbAdapter.instance = new PersistableQuoteDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableQuoteDbAdapter.instance;
  }

  parseCurrency(currency: CurrencyAmount): number {
    return parseFloat(
      ethers.utils.formatUnits(currency.unassignedNumber, currency.decimals),
    );
  }

  flatten(quote: Quote): FlattenedQuote {
    quote.id = quote.id ?? uuidv4();

    return {
      id: quote.id,
      json: JSON.stringify(quote),
      amountOfTokens: this.parseCurrency(quote.finalAmountOfTokens),
      totalPerToken: this.parseCurrency(quote.totalPerToken.BRL),
      netTotal: this.parseCurrency(quote.netTotal.BRL),
      gasAmount: this.parseCurrency(quote.gasAmount.BRL),
      grossTotal: this.parseCurrency(quote.grossTotal.BRL),
      gatewayAmount: this.parseCurrency(quote.gatewayAmount.BRL),
      total: this.parseCurrency(quote.total.BRL),
    };
  }

  unflatten(flattenedQuote: FlattenedQuote): Quote {
    return JSON.parse(flattenedQuote.json);
  }

  async save(quote: Quote): Promise<Quote> {
    const quoteToInsert = this.flatten(quote);

    await this.db().table('quote').insert(quoteToInsert);

    return quote;
  }
}
