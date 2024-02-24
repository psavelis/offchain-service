import {type Knex} from 'knex';
import {GrantType} from '../../../../domain/upstream-domains/identity/authentication/enums/grant-type.enum';

const tableName = 'auth_challenge';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary();
    table.string('user_identifier', 255).notNullable();
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
        {useNative: true, enumName: 'challenge_grant_type'},
      )
      .notNullable();
    table.integer('chain_id').nullable().notNullable();
    table.json('payload').notNullable();
    table.string('uri', 255).notNullable();
    table.string('nonce', 64).notNullable();
    table.string('scope', 255).notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('due_date').notNullable();
    table.string('client_ip', 255).notNullable();
    table.string('client_agent', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
