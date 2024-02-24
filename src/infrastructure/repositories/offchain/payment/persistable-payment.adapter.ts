import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type PersistablePaymentPort} from '../../../../domain/payment/ports/persistable-payment.port';
import {
  Payment,
  type PaymentProps,
} from '../../../../domain/payment/entities/payment.entity';
import * as mapper from './payment-entity.mapper';

const tableName = 'payment';
export class PersistablePaymentDbAdapter implements PersistablePaymentPort {
  static instance: PersistablePaymentDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistablePaymentPort {
    if (!PersistablePaymentDbAdapter.instance) {
      PersistablePaymentDbAdapter.instance = new PersistablePaymentDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistablePaymentDbAdapter.instance;
  }

  async create(payment: Payment): Promise<Payment> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(payment))
      .returning('*');

    const paymentProps: PaymentProps = record,
      {id} = record;

    const created = new Payment(paymentProps, id);

    return created;
  }
}
