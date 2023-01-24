import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableClaimPort } from '../../../../../domain/supply/ports/persistable-claim.port';
import {
  Claim,
  ClaimProps,
} from '../../../../../domain/supply/entities/claim.entity';

import * as mapper from './claim-entity.mapper';

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

  async create(claim: Claim): Promise<Claim> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(claim))
      .returning('*');

    const claimProps: ClaimProps = record,
      { id } = record;

    const created = new Claim(claimProps, id);

    return created;
  }

  async update(claim: Claim): Promise<void> {
    const param = {
      claimId: claim.getId(),
      updatedAt: new Date(),
      transactionHash: claim.getTransactionHash(),
    };

    await this.db().raw(
      `update "claim" as c set c.updated_at = :updatedAt, c.transaction_hash = :transactionHash where c.id = :claimId;`,
      param,
    );
  }
}
