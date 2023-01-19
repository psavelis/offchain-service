import { Knex } from 'knex';

const tableName = 'receipt';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', { primaryKey: true });
    table.integer('chain_id').nullable();
    table.integer('block_number').nullable();
    table.string('transaction_hash').notNullable();
    table
      .string('order_id')
      .notNullable()
      .unique({ indexName: 'ix_receipt_order_id' })
      .references('id')
      .inTable('order');
    table.string('from').nullable();
    table.string('to').nullable().index('ix_receipt_to');
    table.integer('gas_used').nullable().index('ix_receipt_gas_used');
    table.integer('cumulative_gas_used').nullable();
    table.integer('effective_gas_price').nullable();
    // EIP-1559
    table.integer('max_priority_fee_per_gas').nullable();
    table.integer('max_fee_per_gas').nullable();

    table.datetime('created_at').defaultTo(knex.fn.now());

    table.unique(['chain_id', 'transaction_hash'], {
      indexName: 'ix_receipt_chain_transaction',
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
