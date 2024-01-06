import {
  AuditPoolEvent,
  AuditPoolEventType,
} from '../../../../../../domain/badge/dtos/impactful-cultivation/auditpool-event.dto';
import { FetchableAuditPoolEventPort } from '../../../../../../domain/badge/ports/impactful-cultivation/fetchable-auditpool-event.port';
import { IKannaProtocolProvider } from '../../kanna.provider';
import { TypedEventFilter } from '../../protocol/common';
import { KannaAuditStakePool } from '../../protocol/contracts';

export class FetchableAuditPoolEventJsonRpcAdapter
  implements FetchableAuditPoolEventPort
{
  static instance: FetchableAuditPoolEventPort;

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
  ): Promise<AuditPoolEvent[]> {
    const events = await this.fetchOnlyL2(cryptoWallet, ...auditPoolEventTypes);

    return events;
  }

  private async fetchOnlyL2(
    cryptoWallet: string,
    ...auditPoolEventTypes: AuditPoolEventType[]
  ): Promise<AuditPoolEvent[]> {
    const kannaAuditPoolL2 = await this.provider.polygonAuditPool();

    const eventsL2: AuditPoolEvent[] = await this.fetchEvents(
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
  ): Promise<AuditPoolEvent[]> {
    const kannaAuditPoolL1 = await this.provider.auditPool();
    const kannaAuditPoolL2 = await this.provider.polygonAuditPool();

    const eventsL1: AuditPoolEvent[] = await this.fetchEvents(
      auditPoolEventTypes,
      kannaAuditPoolL1,
      cryptoWallet,
    );

    const eventsL2: AuditPoolEvent[] = await this.fetchEvents(
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
  ): Promise<AuditPoolEvent[]> {
    const events = await Promise.all(
      auditPoolEventTypes.map(async (type): Promise<AuditPoolEvent[]> => {
        let filter: TypedEventFilter<any>;

        switch (type) {
          case AuditPoolEventType.INITIALIZED:
            filter =
              kannaAuditPool.filters[type as AuditPoolEventType.INITIALIZED]();
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

        const events: any[] = await kannaAuditPool.queryFilter(filter);

        const mappedEvents: AuditPoolEvent[] = [];

        for (const event of events) {
          const result = {
            name: event.type,
            transactionHash: event.transactionHash,
          };

          const mappedEvent: AuditPoolEvent = await event
            .getBlock()
            .then((block) => {
              const blockTimestamp = block.timestamp * 1000;
              return { ...result, blockTimestamp } as AuditPoolEvent;
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
              return { ...result, blockTimestamp: 0 } as AuditPoolEvent;
            });

          mappedEvents.push(mappedEvent);
        }

        return mappedEvents;
      }),
    );

    return events.flat();
  }
}
