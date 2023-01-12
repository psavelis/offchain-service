import { Knex } from 'knex';

const tableName = 'payment';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table
      .string('order_id')
      .nullable()
      .unique({ indexName: 'ix_payment_order_id' })
      .references('id')
      .inTable('order');
    table
      .string('provider_id')
      .notNullable()
      .unique({ indexName: 'ix_payment_provider_id' });
    table
      .string('clearing_id')
      .notNullable()
      .references('id')
      .inTable('clearing');
    table.string('provider_timestamp').notNullable();
    table.string('effective_date').notNullable();
    table.increments('sequence', { primaryKey: false });

    table.decimal('total', 14, 2).notNullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}

// const ON_UPDATE_TIMESTAMP_FUNCTION = `
//   CREATE OR REPLACE FUNCTION on_update_timestamp()
//   RETURNS trigger AS $$
//   BEGIN
//     NEW.updated_at = now();
//     RETURN NEW;
//   END;
// $$ language 'plpgsql';
// `

// const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION on_update_timestamp`

// exports.up = knex => knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION)
// exports.down = knex => knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION)

// onUpdateTrigger: table => `
// CREATE TRIGGER ${table}_updated_at
// BEFORE UPDATE ON ${table}
// FOR EACH ROW
// EXECUTE PROCEDURE on_update_timestamp();

// const { onUpdateTrigger } = require('../knexfile')

// exports.up = knex =>
//   knex.schema.createTable('posts', t => {
//     t.increments()
//     t.string('title')
//     t.string('body')
//     t.timestamps(true, true)
//   })
//     .then(() => knex.raw(onUpdateTrigger('posts')))

// exports.down = knex => knex.schema.dropTable('posts')
