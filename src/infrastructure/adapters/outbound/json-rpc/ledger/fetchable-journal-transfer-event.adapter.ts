import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { Settings } from '../../../../../domain/common/settings';
import { IKannaProtocolProvider } from '../kanna.provider';
import { FetchableJournalTransferEventPort } from '../../../../../domain/ledger/ports/fetchable-journal-transfer-event.port';
import {
  AccountGroup,
  JournalEntry,
  JournalEntryType,
  JournalMovementType,
} from '../../../../../domain/ledger/entities/journal-entry.entity';
import { TransferEvent } from '../protocol/@openzeppelin/contracts/token/ERC20/ERC20';
import { IsoCodeType } from '../../../../../domain/common/enums/iso-codes.enum';

type Credit = JournalEntry;
type Debit = JournalEntry;

export class FetchableJournalTransferEventRpcAdapter
  implements FetchableJournalTransferEventPort
{
  constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  async fetchByBlockNumber(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ): Promise<JournalEntry[]> {
    const dummyDate = new Date();
    const rawEvents = await this.getEvents(fromEthereumBlock, fromPolygonBlock);

    const purchases = Promise.all(
      rawEvents.map((event) => {
        const { blockNumber, transactionHash, chainId } = event;

        const { from, to, value: amount } = event.args;

        return event
          .getTransactionReceipt()
          .then(
            ({
              gasUsed: gasUsedUint256,
              cumulativeGasUsed: cumulativeGasUsedUint256,
              effectiveGasPrice: effectiveGasPriceUint256,
            }) => {
              const uint256amount = amount.toString();
              const numberAmount = Number(amount.toString()) / 1e18;

              const gasUsed = Number(gasUsedUint256.toString());
              const cumulativeGasUsed = Number(
                cumulativeGasUsedUint256.toString(),
              );
              const effectiveGasPrice = Number(
                effectiveGasPriceUint256.toString(),
              );

              return this.splitCreditDebit(
                chainId,
                transactionHash,
                event,
                to,
                numberAmount,
                uint256amount,
                dummyDate,
                blockNumber,
                gasUsed,
                cumulativeGasUsed,
                effectiveGasPrice,
                from,
              );
            },
          )
          .then(([credit, debit]: JournalEntry[]) => {
            return event
              .getBlock()
              .then((block) => {
                credit.entryDate = debit.entryDate = new Date(
                  block.timestamp * 1000,
                );

                return [credit, debit];
              })
              .catch((err) => {
                console.error(`[transfer][event] error ${err.message}`);

                return [];
              });
          });
      }),
    );

    return purchases.then((purchases) => purchases.flat());
  }

  private splitCreditDebit(
    chainId: NetworkType,
    transactionHash: string,
    event,
    to: string,
    numberAmount: number,
    uint256amount: string,
    dummyDate: Date,
    blockNumber: number,
    gasUsed: number,
    cumulativeGasUsed: number,
    effectiveGasPrice: number,
    from: string,
  ): [Credit, Debit] {
    const creditJournalEntry = new JournalEntry(this.settings, {
      movementType: JournalMovementType.Credit,
      chainId,
      transactionHash,
      logIndex: event.logIndex,
      entryType: JournalEntryType.Movement,
      account: to,
      accountGroup: AccountGroup.Holder,
      amount: +numberAmount,
      uint256amount,
      entryDate: dummyDate,
      isoCode: IsoCodeType.KNN,
      blockNumber,
      gasUsed,
      cumulativeGasUsed,
      effectiveGasPrice,
    });

    const debitJournalEntry = new JournalEntry(this.settings, {
      movementType: JournalMovementType.Debit,
      chainId,
      transactionHash,
      logIndex: event.logIndex,
      entryType: JournalEntryType.Movement,
      account: from,
      accountGroup: AccountGroup.Holder,
      amount: -numberAmount,
      uint256amount,
      entryDate: dummyDate,
      isoCode: IsoCodeType.KNN,
      blockNumber,
      gasUsed,
      cumulativeGasUsed,
      effectiveGasPrice,
    });
    return [creditJournalEntry, debitJournalEntry];
  }

  private async getEvents(fromEthereumBlock: number, fromPolygonBlock: number) {
    if (this.settings.blockchain.current.layer === LayerType.L1) {
      return this.getLayer1OnlyEvents(fromEthereumBlock);
    }

    return this.getL1andL2Events(fromEthereumBlock, fromPolygonBlock);
  }

  private async getLayer1OnlyEvents(fromEthereumBlock: number) {
    const knnToken = await this.provider.token();

    const tokenEvents: TransferEvent[] = await knnToken.queryFilter(
      knnToken.filters.Transfer(),
      fromEthereumBlock,
    );

    if (this.settings.blockchain.current.layer !== LayerType.L1) {
      throw new Error(
        `Cannot fetch L1 events on L2 chain ${this.settings.blockchain.current.id}`,
      );
    }

    const chainId = this.settings.blockchain.current.id;

    const rawEvents = tokenEvents.map((event) => ({ ...event, chainId }));

    return rawEvents;
  }

  private async getL1andL2Events(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ) {
    const [knnToken, fxKnnToken] = await Promise.all([
      this.provider.token(),
      this.provider.tokenPolygon(),
    ]);

    const [tokenEvents, fxTokenEvents]: TransferEvent[][] = await Promise.all([
      knnToken.queryFilter(knnToken.filters.Transfer(), fromEthereumBlock),
      fxKnnToken.queryFilter(fxKnnToken.filters.Transfer(), fromPolygonBlock),
    ]);

    const isProduction = process.env.NODE_ENV === 'production';

    const ethereumChainId = isProduction
      ? NetworkType.Ethereum
      : NetworkType.EthereumSepolia;

    const polygonChainId = isProduction
      ? NetworkType.Polygon
      : NetworkType.PolygonMumbai;

    const rawEvents = [
      tokenEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
      fxTokenEvents.map((event) => ({ ...event, chainId: polygonChainId })),
    ].flat();

    return rawEvents;
  }
}
