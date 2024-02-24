import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type PersistableClaimPort} from '../../../../domain/supply/ports/persistable-claim.port';
import {
  Claim,
  type ClaimProps,
} from '../../../../domain/supply/entities/claim.entity';

import * as mapper from './claim-entity.mapper';

const tableName = 'claim';
export class PersistableClaimDbAdapter implements PersistableClaimPort {
  static instance: PersistableClaimDbAdapter;
  private readonly db: () => Knex;

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
      {id} = record;

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
      'update "claim" set updated_at = :updatedAt, transaction_hash = :transactionHash where id = :claimId;',
      param,
    );
  }
}
