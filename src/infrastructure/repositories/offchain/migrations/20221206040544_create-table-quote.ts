import {type Knex} from 'knex';

const tableName = 'quote';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table.text('json').notNullable();
    table.float('amountOfTokens').notNullable();
    table.float('totalPerToken').notNullable();
    table.float('netTotal').notNullable();
    table.float('gasAmount').notNullable();
    table.float('total').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
