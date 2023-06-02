import { Knex } from 'knex';

const tableName = 'mint_history';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table.integer('chain_id').nullable();
    table.date('due_date').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('chain_id');
    table.dropColumn('due_date');
  });
}
