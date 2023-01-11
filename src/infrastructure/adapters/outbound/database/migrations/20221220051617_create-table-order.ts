import { Knex } from 'knex';

const tableName = 'order';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table.string('parent_id').nullable().references('id').inTable('order'); // for expired
    table.string('payment_option').notNullable();
    table.string('iso_code').notNullable();
    table.string('end_to_end_id').notNullable();
    table.string('total').notNullable();
    table.json('amount_of_tokens').notNullable(); // Uint256
    table.string('user_identifier').notNullable();
    table.string('identifier_type').notNullable();
    table.string('client_ip').nullable();
    table.string('client_agent').nullable();
    table.string('client_os').nullable();
    table.integer('status').notNullable(); // 1-Requested, 2-Confirmed, 3-Locked, 4-Challenged, 5-Owned, 6-Claimed, 7-Expired, 8-Canceled //
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('expires_at').nullable(); // quando expirado, gerar outra cotacao do momento ao identificar

    // TODO: indexes
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
