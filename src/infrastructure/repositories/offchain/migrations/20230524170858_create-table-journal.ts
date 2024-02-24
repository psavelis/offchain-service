import {type Knex} from 'knex';

const tableName = 'journal';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', {primaryKey: true});

    table.bigInteger('chain_id').notNullable();
    table.bigInteger('block_number').notNullable();
    table.string('transaction_hash').notNullable();

    table.decimal('amount', 20, 8).notNullable();
    table.string('uint256_amount').notNullable();
    table.string('movement_type').notNullable();
    table.string('entry_type').notNullable();
    table.string('account').notNullable();
    table.string('account_group').notNullable();
    table.string('iso_code').notNullable();
    table.bigInteger('log_index').notNullable();
    table.datetime('entry_date').notNullable();

    table.bigInteger('gas_used').nullable();
    table.bigInteger('cumulative_gas_used').nullable();
    table.bigInteger('effective_gas_price').nullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
