import {type Knex} from 'knex';

const tableName = 'auth_role';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary();
    table.string('fingerprint', 255).notNullable();
    table.string('user_identifier', 255).notNullable();
    table.string('transaction_hash', 255).notNullable();
    table.integer('block_number').notNullable();
    table.string('source_address', 255).notNullable();
    table.string('event_type', 255).notNullable();
    table.integer('chain_id').notNullable();
    table.string('role_type', 255).notNullable();
    table.datetime('expires_at').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
