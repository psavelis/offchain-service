import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableClaimPort } from '../../../../../domain/supply/ports/persistable-claim.port';
import { Claim } from '../../../../../domain/supply/entities/claim.entity';

const tableName = 'claim';
export class PersistableClaimDbAdapter implements PersistableClaimPort {
  static instance: PersistableClaimDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableClaimPort {
    if (!PersistableClaimDbAdapter.instance) {
      PersistableClaimDbAdapter.instance = new PersistableClaimDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableClaimDbAdapter.instance;
  }

  async create(claim: Claim): Promise<void> {
    // TODO: PERSIS
    // await this.db().raw(
    //   `insert into ${tableName} (order_id, from_status, to_status, reason) values (:orderId, (select o.status from "order" as o where o.id = :orderId), :toStatus, :reason);`,
    //   param,
    // );
    // await this.db().raw(
    //   `update "order" as o set status = :toStatus where o.id = :orderId;`,
    //   param,
    // );
  }
}
