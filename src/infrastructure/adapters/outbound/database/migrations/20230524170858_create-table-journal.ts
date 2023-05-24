import { Knex } from 'knex';

const tableName = 'journal';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', { primaryKey: true });

    table.integer('chain_id').notNullable();
    table.integer('block_number').notNullable();
    table.string('transaction_hash').notNullable();

    table.decimal('amount', 20, 8).notNullable();
    table.string('uint256_amount').notNullable();
    table.string('movement_type').notNullable();
    table.string('entry_type').notNullable();
    table.string('account').notNullable();
    table.string('account_group').notNullable();
    table.string('iso_code').notNullable();
    table.integer('log_index').notNullable();
    table.datetime('entry_date').notNullable();

    table.integer('gas_used').nullable();
    table.integer('cumulative_gas_used').nullable();
    table.integer('effective_gas_price').nullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
