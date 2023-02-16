import { Knex } from 'knex';

const tableName = 'challenge';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS answer;`);
  await knex.raw(`DROP TABLE IF EXISTS ${tableName};`);

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
      .unique({ indexName: 'ix_challenge_verification_hash' });

    table
      .string('deactivation_hash')
      .notNullable()
      .index('ix_challenge_deactivation_hash');

    table
      .datetime('deactivated_at')
      .nullable()
      .index('ix_challenge_deactivated_at');

    table.datetime('expires_at').notNullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
