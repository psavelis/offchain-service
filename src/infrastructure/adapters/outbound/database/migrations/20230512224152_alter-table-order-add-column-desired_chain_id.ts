import { Knex } from 'knex';
import { NetworkType } from 'src/domain/common/enums/network-type.enum';

const tableName = 'order';
const columnName = 'desired_chain_id';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(tableName, (table) => {
    table.string(columnName).nullable();
  });

  await knex(tableName).update({ desired_chain_id: NetworkType.Ethereum });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn(columnName);
  });
}
