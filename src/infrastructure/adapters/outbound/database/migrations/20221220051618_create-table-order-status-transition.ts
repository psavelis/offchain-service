import { Knex } from 'knex';

const tableName = 'order_status_transition';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', { primaryKey: true });
    table.string('order_id').references('id').inTable('order');
    table.integer('from_status').notNullable();
    table.integer('to_status').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
