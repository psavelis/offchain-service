import {type Knex} from 'knex';

const tableName = 'balance';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', {primaryKey: true});

    table.string('account').notNullable();
    table.string('group').notNullable();
    table.decimal('total', 20, 8).notNullable();
    table.decimal('l1', 20, 8).notNullable();
    table.decimal('l2', 20, 8).notNullable();
    table.string('status').notNullable();
    table.integer('nonce').notNullable();
    table.datetime('join_date').nullable();
    table.datetime('exit_date').nullable();
    table.datetime('last_journal_entry_date').nullable();
    table.string('last_journal_movement_type').nullable();
    table.decimal('last_journal_entry_amount', 20, 8).nullable();
    table.string('last_journal_entry_chain_id').nullable();
    table.text('checksum').notNullable();
    table.string('uint256_total').notNullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').nullable();

    table.unique(['account', 'group']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
