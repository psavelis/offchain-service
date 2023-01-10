import { Knex } from 'knex';

const tableName = 'challenge';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table.string('lock_id').notNullable().references('id').inTable('lock');

    table.string('verification_address').notNullable(); // TODO: precisará ser feito no código a verificação pra poder inserir o challenge
    table.string('onchain_address').notNullable();
    table.string('verification_key').notNullable(); // TODO: slice de 6 digitos de um base36 aleatório..

    table
      .string('verification_cipher')
      .notNullable()
      .unique({ indexName: 'ix_challenge_verification_cipher' }); // TODO: Buffer.from(`verification_address:onchain_address:verification_key`,'ascii').toString('base64') ou outro cipher

    table.datetime('expires_at').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());

    // TODO: para receber o challenge = email+otp
    // TODO: indexes
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
