import {type Knex} from 'knex';

const tableName = 'purchase';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', {primaryKey: true});

    table.datetime('payment_date').notNullable();

    table.decimal('total_knn', 20, 8).notNullable();
    table.decimal('knn_price_in_usd', 20, 8).notNullable();
    table.decimal('total_usd', 20, 8).notNullable();
    table.decimal('total_gas_usd', 20, 8).notNullable();

    table.string('contract_address').notNullable();
    table.string('network').notNullable();
    table.string('crypto_wallet').notNullable();
    table
      .string('purchase_transaction_hash')
      .notNullable()
      .unique({indexName: 'ix_purchase_transaction_hash'});

    table.decimal('total_eth', 20, 8).nullable();
    table.decimal('total_gas_eth', 20, 8).nullable();
    table.decimal('eth_price_in_usd', 20, 8).nullable();
    table.integer('ethereum_block_number').nullable();

    table.decimal('total_matic', 20, 8).nullable();
    table.decimal('total_gas_matic', 20, 8).nullable();
    table.decimal('matic_price_in_usd', 20, 8).nullable();
    table.integer('polygon_block_number').nullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
