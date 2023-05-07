import { Knex } from 'knex';

const tableName = 'claim';
const columnName = 'user_transaction_hash';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table
      .string(columnName)
      .nullable()
      .references('transaction_hash')
      .inTable('user_receipt');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn(columnName);
  });
}
