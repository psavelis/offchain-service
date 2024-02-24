import { type Knex } from 'knex';

const tableName = 'mint_history';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table.datetime('due_date').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, () => {});
}
