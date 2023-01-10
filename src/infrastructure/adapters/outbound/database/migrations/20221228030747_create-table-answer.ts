import { Knex } from 'knex';

const tableName = 'answer';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table
      .string('challenge_id') // TODO: precisará ser feito no código a verificação pra poder inserir o challenge
      .unique({ indexName: 'ix_answer_challenge_id' })
      .notNullable()
      .references('id')
      .inTable('challenge');
    table
      .string('verification_cipher')
      .notNullable()
      .references('verification_cipher')
      .inTable('challenge');
    table
      .string('order_id')
      .notNullable()
      .unique({ indexName: 'ix_answer_order_id' })
      .references('id')
      .inTable('order');
    table.datetime('created_at').defaultTo(knex.fn.now());

    // TODO: para receber o challenge = email+otp (precisa enviar o email junto com otp quando fizer o post! + carteira destino)
    // TODO: indexes
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
