import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type PersistableOrderStatusTransitionPort} from '../../../../domain/order/ports/persistable-order-status-transition.port';
import {type Order} from '../../../../domain/order/entities/order.entity';
import {type TransitionInfo} from '../../../../domain/order/dtos/transition-info.dto';

const tableName = 'order_status_transition';
export class PersistableOrderStatusTransitionDbAdapter
implements PersistableOrderStatusTransitionPort {
  static instance: PersistableOrderStatusTransitionDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableOrderStatusTransitionPort {
    if (!PersistableOrderStatusTransitionDbAdapter.instance) {
      PersistableOrderStatusTransitionDbAdapter.instance =
        new PersistableOrderStatusTransitionDbAdapter(knexPostgresDb);
    }

    return PersistableOrderStatusTransitionDbAdapter.instance;
  }

  async create(order: Order, info: TransitionInfo): Promise<void> {
    const param = {
      orderId: order.getId(),
      toStatus: order.getStatus(),
      reason: info.reason,
      pastDue: info.pastDue,
    };

    if (!param.pastDue) {
      await this.db().raw(
        `insert into ${tableName} (order_id, from_status, to_status, reason) values (:orderId, (select o.status from "order" as o where o.id = :orderId), :toStatus, :reason);`,
        param,
      );
    } else {
      await this.db().raw(
        `insert into ${tableName} (order_id, from_status, to_status, reason, created_at) values (:orderId, (select o.status from "order" as o where o.id = :orderId), :toStatus, :reason, :pastDue);`,
        param,
      );
    }

    await this.db().raw(
      'update "order" as o set status = :toStatus where o.id = :orderId;',
      param,
    );
  }
}
