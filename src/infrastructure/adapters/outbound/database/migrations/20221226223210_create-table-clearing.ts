import { Knex } from 'knex';

const tableName = 'clearing';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary();
    table.string('hash').notNullable();
    table.string('target').notNullable();
    table.string('offset').notNullable();
    table.integer('status').nullable().index('ix_clearing_status');
    table
      .datetime('created_at')
      .defaultTo(knex.fn.now())
      .index('ix_clearing_created_at');
    table.datetime('ended_at').nullable();
    table.integer('duration_ms').nullable();
    table.integer('total_entries').nullable();
    table.decimal('total_amount', 14, 2).nullable();
    table.text('remarks').nullable();

    table.integer('sequence').unsigned().nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
