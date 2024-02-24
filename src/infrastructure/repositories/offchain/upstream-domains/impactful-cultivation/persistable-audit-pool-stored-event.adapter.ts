import {type Knex} from 'knex';
import {parseEntity, parseRow} from './audit-pool-event.mapper';
import {type PersistableAuditPoolEventPort} from '../../../../../domain/upstream-domains/impactful-cultivation/ports/persistable-audit-pool-event.port';
import {type AuditPoolEvent} from '../../../../../domain/upstream-domains/impactful-cultivation/entities/audit-pool-event.entity';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';

const tableName = 'audit_pool_event';

export class PersistableAuditPoolStoredEventDbAdapter
implements PersistableAuditPoolEventPort {
  static instance: PersistableAuditPoolStoredEventDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableAuditPoolEventPort {
    if (!PersistableAuditPoolStoredEventDbAdapter.instance) {
      PersistableAuditPoolStoredEventDbAdapter.instance =
        new PersistableAuditPoolStoredEventDbAdapter(knexPostgresDb);
    }

    return PersistableAuditPoolStoredEventDbAdapter.instance;
  }

  async create(auditPoolEvent: AuditPoolEvent): Promise<AuditPoolEvent> {
    const [record] = await this.db()
      .table(tableName)
      .insert(parseEntity(auditPoolEvent))
      .returning('*');

    const created: AuditPoolEvent = parseRow(record);

    return created;
  }
}
