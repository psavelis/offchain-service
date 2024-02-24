import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {type PersistableRolePort} from '../../../../../domain/upstream-domains/identity/authentication/ports/persistable-role.port';
import {type Role} from '../../../../../domain/upstream-domains/identity/authentication/entities/role.entity';
import {parseEntity, parseRow} from './role.mapper';

const tableName = 'auth_role';

export class PersistableRoleDbAdapter implements PersistableRolePort {
  static instance: PersistableRoleDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableRolePort {
    if (!PersistableRoleDbAdapter.instance) {
      PersistableRoleDbAdapter.instance = new PersistableRoleDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableRoleDbAdapter.instance;
  }

  async create(role: Role): Promise<Role> {
    const [record] = await this.db()
      .table(tableName)
      .insert(parseEntity(role))
      .returning('*');

    const created: Role = parseRow(record);

    return created;
  }
}
