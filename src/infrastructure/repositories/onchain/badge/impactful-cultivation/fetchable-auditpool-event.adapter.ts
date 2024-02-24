import { type FetchableAuditPoolRemoteEventPort } from '../../../../../domain/badge/ports/impactful-cultivation/fetchable-auditpool-remote-event.port';
import { type AuditPoolRemoteEventDto } from '../../../../../domain/upstream-domains/impactful-cultivation/dtos/audit-pool-remote-event.dto';
import { AuditPoolEventType } from '../../../../../domain/upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';
import { type IKannaProtocolProvider } from '../../kanna.provider';
import { type TypedEventFilter } from '../../protocol/common';
import { type KannaAuditStakePool } from '../../protocol/contracts';

type AuditPoolEventResult = {
  type?: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  args: object[];
  removeListener;
  getBlock;
  getTransaction;
  getTransactionReceipt;
  address;
  data;
  topics;
  transactionHash;
  logIndex;
};

export class FetchableAuditPoolEventJsonRpcAdapter
  implements FetchableAuditPoolRemoteEventPort
{
  static instance: FetchableAuditPoolRemoteEventPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableAuditPoolEventJsonRpcAdapter.instance) {
      FetchableAuditPoolEventJsonRpcAdapter.instance =
        new FetchableAuditPoolEventJsonRpcAdapter(provider);
    }

    return FetchableAuditPoolEventJsonRpcAdapter.instance;
  }

  async fetch(
    cryptoWallet: string,
    ...auditPoolEventTypes: AuditPoolEventType[]
  ): Promise<AuditPoolRemoteEventDto[]> {
    const events = await this.fetchOnlyL2(cryptoWallet, ...auditPoolEventTypes);

    return events;
  }

  private async fetchOnlyL2(
    cryptoWallet: string,
    ...auditPoolEventTypes: AuditPoolEventType[]
  ): Promise<AuditPoolRemoteEventDto[]> {
    const kannaAuditPoolL2 = await this.provider.polygonAuditPool();

    const eventsL2: AuditPoolRemoteEventDto[] = await this.fetchEvents(
      auditPoolEventTypes,
      kannaAuditPoolL2,
      cryptoWallet,
    );

    return eventsL2;
  }

  /**
   * @deprecated use fetchOnlyL2 instead
   * @param cryptoWallet wallet to fetch events for (if applicable)
   * @param auditPoolEventTypes events to fetch
   * @returns {Promise<AuditPoolEvent[]>}
   * @description
   * This method is deprecated because it fetches events from both L1 and L2.
   * This is not needed anymore because the audit pool is only on L2.
   * This method is kept for backwards compatibility.
   * @see fetchOnlyL2
   * @see this.fetchMultiChain
   * @see fetchEvents
   */
  private async fetchMultiChain(
    cryptoWallet: string,
    ...auditPoolEventTypes: AuditPoolEventType[]
  ): Promise<AuditPoolRemoteEventDto[]> {
    const kannaAuditPoolL1 = await this.provider.auditPool();
    const kannaAuditPoolL2 = await this.provider.polygonAuditPool();

    const eventsL1: AuditPoolRemoteEventDto[] = await this.fetchEvents(
      auditPoolEventTypes,
      kannaAuditPoolL1,
      cryptoWallet,
    );

    const eventsL2: AuditPoolRemoteEventDto[] = await this.fetchEvents(
      auditPoolEventTypes,
      kannaAuditPoolL2,
      cryptoWallet,
    );

    return [...eventsL1, ...eventsL2];
  }

  private async fetchEvents(
    auditPoolEventTypes: AuditPoolEventType[],
    kannaAuditPool: KannaAuditStakePool,
    cryptoWallet: string,
  ): Promise<AuditPoolRemoteEventDto[]> {
    const events = await Promise.all(
      auditPoolEventTypes.map(
        async (type): Promise<AuditPoolRemoteEventDto[]> => {
          let filter: TypedEventFilter<AuditPoolEventResult>;

          switch (type) {
            case AuditPoolEventType.INITIALIZED:
              filter =
                kannaAuditPool.filters[
                  type as AuditPoolEventType.INITIALIZED
                ]();
              break;
            case AuditPoolEventType.FINALIZED:
              filter =
                kannaAuditPool.filters[type as AuditPoolEventType.FINALIZED]();
              break;
            case AuditPoolEventType.NEW_STAKE:
              filter = kannaAuditPool.filters[
                type as AuditPoolEventType.NEW_STAKE
              ](null, cryptoWallet);
              break;
            case AuditPoolEventType.WITHDRAW:
              filter = kannaAuditPool.filters[
                type as AuditPoolEventType.WITHDRAW
              ](null, cryptoWallet);
              break;
            case AuditPoolEventType.LEFTOVER_TRANSFERRED:
              filter =
                kannaAuditPool.filters[
                  type as AuditPoolEventType.LEFTOVER_TRANSFERRED
                ](cryptoWallet);
              break;
            default:
              throw new Error(`invalid audit pool event type: ${type}`);
          }

          const events: AuditPoolEventResult[] =
            await kannaAuditPool.queryFilter(filter);

          const mappedEvents: AuditPoolRemoteEventDto[] = [];

          for (const event of events) {
            const result = {
              name: event.type,
              transactionHash: event.transactionHash,
            };

            const mappedEvent: AuditPoolRemoteEventDto = await event
              .getBlock()
              .then((block) => {
                const blockTimestamp = block.timestamp * 1000;
                return {
                  ...result,
                  blockTimestamp,
                } as AuditPoolRemoteEventDto;
              })
              .catch((e) => {
                console.error(
                  JSON.stringify({
                    stack: e.stack,
                    message: e.message,
                    event,
                    name: FetchableAuditPoolEventJsonRpcAdapter.name,
                  }),
                );
                return {
                  ...result,
                  blockTimestamp: 0,
                } as AuditPoolRemoteEventDto;
              });

            mappedEvents.push(mappedEvent);
          }

          return mappedEvents;
        },
      ),
    );

    return events.flat();
  }
}
