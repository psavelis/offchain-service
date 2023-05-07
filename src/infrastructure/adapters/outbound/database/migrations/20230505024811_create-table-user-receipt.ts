import { Knex } from 'knex';

const tableName = 'user_receipt';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', { primaryKey: true });
    table.integer('chain_id').nullable();
    table.integer('block_number').nullable();
    table
      .string('transaction_hash')
      .unique({ indexName: 'ix_user_receipt_transaction_hash' })
      .notNullable();
    table
      .string('order_id')
      .notNullable()
      .unique({ indexName: 'ix_user_receipt_order_id' })
      .references('id')
      .inTable('order');
    table.string('from').nullable();
    table.string('to').nullable();
    table.string('gas_used').nullable();
    table.string('cumulative_gas_used').nullable();
    table.string('effective_gas_price').nullable();
    table.decimal('amount_in_knn', 20, 8).notNullable(); // total_knn
    table.string('user_identifier').nullable(); // cryptoWallet
    table
      .string('payment_id')
      .notNullable()
      .unique({ indexName: 'ix_user_receipt_payment_id' })
      .references('id')
      .inTable('payment');

    table.datetime('created_at').defaultTo(knex.fn.now());

    table.unique(['chain_id', 'transaction_hash'], {
      indexName: 'ix_user_receipt_chain_transaction',
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
