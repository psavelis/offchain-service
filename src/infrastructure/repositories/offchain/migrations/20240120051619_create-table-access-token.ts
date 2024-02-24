import {type Knex} from 'knex';
import {GrantType} from '../../../../domain/upstream-domains/identity/authentication/enums/grant-type.enum';

const tableName = 'acess_token';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary();
    table
      .uuid('challenge_id')
      .references('id')
      .inTable('auth_challenge')
      .notNullable();
    table
      .enum(
        'grant_type',
        [
          GrantType.AUTHORIZATION_CODE,
          GrantType.REFRESH_TOKEN,
          GrantType.CLIENT_CREDENTIALS,
          GrantType.PASSWORD,
          GrantType.EIP4361,
          GrantType.ERC1271,
        ],
        {useNative: true, enumName: 'token_grant_type'},
      )
      .notNullable();
    table.integer('chain_id').notNullable();
    table.json('roles').notNullable();
    table.json('scopes').notNullable();
    table.datetime('due_date').notNullable();
    table.string('client_ip', 255).notNullable();
    table.string('client_agent', 255).notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
