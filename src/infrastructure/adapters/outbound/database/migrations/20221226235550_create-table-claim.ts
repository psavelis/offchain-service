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

    table.json('amount_of_tokens').notNullable();

    // Insert, dps update quando tiver o retorno dos dados do block e tx
    // POST-ONCHAIN-FIELDS
    table.string('transaction_hash').nullable();
    table.integer('block_id').nullable();
    table.string('event_timestamp').nullable();
    table.integer('event_id').nullable();
    // POST-ONCHAIN-FIELDS

    table.string('chain_id').notNullable();
    table.string('network_name').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());

    // TODO: indexes
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
