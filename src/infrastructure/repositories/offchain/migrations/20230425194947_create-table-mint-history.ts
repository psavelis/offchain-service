import {type Knex} from 'knex';

const tableName = 'mint_history';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', {primaryKey: true});

    table.integer('amount');
    table.integer('reference_metadata_id');
    table.string('crypto_wallet');
    table.boolean('valid');
    table.string('description').nullable();
    table.string('client_ip').nullable();
    table.string('client_agent').nullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
