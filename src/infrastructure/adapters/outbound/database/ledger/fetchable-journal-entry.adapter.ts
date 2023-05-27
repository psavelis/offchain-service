import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { FetchableJournalEntryPort } from '../../../../../domain/ledger/ports/fetchable-journal-entry.port';

import {
  JournalMovementType,
  JournalEntry,
} from '../../../../../domain/ledger/entities/journal-entry.entity';
import { Settings } from '../../../../../domain/common/settings';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';

export class FetchableJournalEntryDbAdapter
  implements FetchableJournalEntryPort
{
  static instance: FetchableJournalEntryDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(
    readonly settings: Settings,
    readonly knexPostgresDb: KnexPostgresDatabase,
  ) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    settings: Settings,
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableJournalEntryPort {
    if (!FetchableJournalEntryDbAdapter.instance) {
      FetchableJournalEntryDbAdapter.instance =
        new FetchableJournalEntryDbAdapter(settings, knexPostgresDb);
    }

    return FetchableJournalEntryDbAdapter.instance;
  }

  async fetch(
    chainId: number,
    transactionHash: string,
    logIndex: number,
    movementType: JournalMovementType,
  ): Promise<JournalEntry | undefined> {
    const query = `select
      je.id as id,
      je.chain_id as chainId,
      je.block_number as blockNumber,
      je.transaction_hash as transactionHash,
      je.amount as amount,
      je.uint256_amount as uint256amount,
      je.movement_type as movementType,
      je.entry_type as entryType,
      je.account as account,
      je.account_group as accountGroup,
      je.iso_code as isoCode,
      je.log_index as logIndex,
      je.entry_date as entryDate,
      je.gas_used as gasUsed,
      je.cumulative_gas_used as cumulativeGasUsed,
      je.effective_gas_price as effectiveGasPrice,
      je.created_at as createdAt
    from journal je where je.chain_id = :chainId and je.transaction_hash = :transactionHash and je.log_index = :logIndex and je.movement_type = :movementType`;

    const param = { chainId, transactionHash, logIndex, movementType };

    const result = await this.db().raw(query, param);

    if (!result?.rows?.length) {
      return undefined;
    }

    return new JournalEntry(
      this.settings,
      {
        account: result.rows[0].account,
        accountGroup: result.rows[0].accountgroup,
        amount: Number(result.rows[0].amount),
        blockNumber: Number(result.rows[0].blocknumber),
        chainId: Number(result.rows[0].chainid),
        cumulativeGasUsed: Number(result.rows[0].cumulativegasused),
        effectiveGasPrice: Number(result.rows[0].effectivegasprice),
        entryDate: new Date(result.rows[0].entrydate),
        entryType: result.rows[0].entrytype,
        gasUsed: Number(result.rows[0].gasused),
        isoCode: result.rows[0].isocode,
        logIndex: Number(result.rows[0].logindex),
        movementType: result.rows[0].movementtype,
        transactionHash: result.rows[0].transactionhash,
        uint256amount: result.rows[0].uint256amount,
      },
      result.rows[0].id,
    );
  }

  async fetchLastBlocks(): Promise<{
    ethereumLastBlock: number;
    polygonLastBlock: number;
  }> {
    const isProd = process.env.NODE_ENV === 'production';

    const param = {
      l1: isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia,
      l2: isProd ? NetworkType.Polygon : NetworkType.PolygonMumbai,
    };

    const query = `select
      max(je.block_number) filter (where je.chain_id = :l1) as ethereumLastBlock,
      max(je.block_number) filter (where je.chain_id = :l2) as polygonLastBlock
    from journal je`;

    const { rows: records } = await this.db().raw(query, param);

    if (!records?.length) {
      return {
        ethereumLastBlock: 0,
        polygonLastBlock: 0,
      };
    }

    return {
      ethereumLastBlock: records[0].ethereumlastblock - 1,
      polygonLastBlock: records[0].polygonlastblock - 1,
    };
  }
}
