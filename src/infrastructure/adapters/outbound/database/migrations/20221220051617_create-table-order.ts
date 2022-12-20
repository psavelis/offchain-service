import { Knex } from 'knex';

const tableName = 'order';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table.string('payment_option').notNullable();
    table.string('iso_code').notNullable();
    table.string('end_to_end_id').notNullable();
    table.string('total').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());

    // TODO: indexes
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
