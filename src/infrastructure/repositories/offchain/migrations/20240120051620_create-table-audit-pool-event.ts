//  workflow <- audit-pool <- audit-pool-event
//          <- producer
// producer <- audit-pool <- audit-module -> (audit-module-type::enum)
// producer <- audit-pool <- audit-module <- entry-manifest -> (user::)
// producer <- audit-pool <- audit-module <- evaluation-metrics
// producer <- audit-pool <- audit-module <- compliance-checklist -> assessment-parameters
// producer <- audit-pool <- audit-module <- RegulatoryBenchmarks -> assessment-parameters

import {type Knex} from 'knex';

const tableName = 'audit_pool_event';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary();
    table.string('user_identifier', 255).notNullable();
    table.string('pool_address', 255).notNullable();
    table.string('transaction_hash', 255).notNullable();
    table.integer('block_number').notNullable();
    table.integer('block_timestamp').notNullable();
    table.integer('chain_id').notNullable();
    table.string('event_type', 255).notNullable();
    table.string('amount_uint256', 255).notNullable();
    table.decimal('amount', 20, 8).notNullable();
    table.integer('gas_used').notNullable();
    table.integer('cumulative_gas_used').notNullable();
    table.integer('effective_gas_price').notNullable();
    table.string('stake_id', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
