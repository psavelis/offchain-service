import { Knex } from 'knex';

const tableName = 'claim';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table
      .string('payment_id')
      .notNullable()
      .unique({ indexName: 'ix_claim_payment_id' })
      .references('id')
      .inTable('payment');
    table.string('onchain_address').notNullable();
    table
      .string('order_id')
      .notNullable()
      .unique({ indexName: 'ix_claim_order_id' })
      .references('id')
      .inTable('order');
    table.string('uint256_amount').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());

    // updated after receipt
    table
      .string('transaction_hash')
      .nullable()
      .references('transaction_hash')
      .inTable('receipt');
    table.datetime('updated_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
