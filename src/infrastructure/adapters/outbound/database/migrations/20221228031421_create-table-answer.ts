import { Knex } from 'knex';

const tableName = 'answer';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments('id', { primaryKey: true });

    table
      .string('identifier_order_id')
      .notNullable()
      .references('id')
      .inTable('order');
    table.string('client_ip').nullable();
    table.string('client_agent').nullable();
    table
      .string('verification_hash')
      .notNullable()
      .unique({ indexName: 'ix_answer_verification_hash' })
      .references('verification_hash')
      .inTable('challenge');

    table
      .integer('challenge_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('challenge');

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
