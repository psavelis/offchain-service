import { DAPP_DOMAIN } from '../../../../../domain/common/constants/domains.contants';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { type EncryptionPort } from '../../../../../domain/common/ports/encryption.port';
import { type Settings } from '../../../../../domain/common/settings';
import { AuditPoolEvent } from '../../../../../domain/upstream-domains/impactful-cultivation/entities/audit-pool-event.entity';
import { AuditPoolEventType } from '../../../../../domain/upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';
import { type FetchableOnChainAuditPoolEventPort } from '../../../../../domain/upstream-domains/impactful-cultivation/ports/fetchable-onchain-audit-pool-event.port';
import { type IKannaProtocolProvider } from '../../kanna.provider';
import { type NewStakeEvent } from '../../protocol/contracts/KannaAuditStakePool';

export class FetchableOnChainAuditPoolEventJsonRpcAdapter
  implements FetchableOnChainAuditPoolEventPort
{
  static instance: FetchableOnChainAuditPoolEventJsonRpcAdapter;

  private constructor(
    readonly provider: IKannaProtocolProvider,
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
  ) {}

  static getInstance(
    provider: IKannaProtocolProvider,
    settings: Settings,
    encryptionPort: EncryptionPort,
  ) {
    if (!FetchableOnChainAuditPoolEventJsonRpcAdapter.instance) {
      FetchableOnChainAuditPoolEventJsonRpcAdapter.instance =
        new FetchableOnChainAuditPoolEventJsonRpcAdapter(
          provider,
          settings,
          encryptionPort,
        );
    }

    return FetchableOnChainAuditPoolEventJsonRpcAdapter.instance;
  }

  async fetchByBlockNumber(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ): Promise<AuditPoolEvent[]> {
    const dummyDate = new Date();
    const rawEvents = await this.getNewStakeEvents(
      fromEthereumBlock,
      fromPolygonBlock,
    );

    const stakeEvents = Promise.all(
      rawEvents.map(async (event) => {
        const { blockNumber, transactionHash, chainId } = event;

        const { stakeId, wallet, amount } = event.args; // , timestamp }

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

              const newEntity = new AuditPoolEvent({
                userIdentifier: wallet,
                poolAddress: event.address,
                transactionHash,
                blockNumber,
                blockTimestamp: dummyDate.getTime(),
                chainId,
                eventType: AuditPoolEventType.NEW_STAKE,
                amountUint256: uint256amount,
                amount: numberAmount,
                gasUsed,
                cumulativeGasUsed,
                effectiveGasPrice,
                stakeId,
              });

              return newEntity;
            },
          )
          .then(async (entity: AuditPoolEvent) => {
            return event
              .getBlock()
              .then((block) => {
                entity.setBlockNumber(block.number);
                entity.setBlockTimestamp(block.timestamp);

                return entity;
              })
              .catch((err) => {
                console.error(
                  `[audit-pool][import][event] error ${err.message} ${err.stack}`,
                );

                return [];
              });
          });
      }),
    );

    const flattened = await stakeEvents.then((purchases) => purchases.flat());

    for (const event of flattened) {
      const encryptedIdentifier = await this.encryptionPort.encrypt(
        event.getUserIdentifier(),
        String(event.getChainId()) + DAPP_DOMAIN,
        this.settings.cbc.key,
      );

      event.setUserIdentifier(encryptedIdentifier);
    }

    return flattened;
  }

  private async getNewStakeEvents(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ) {
    const polygonAuditPool = await this.provider.polygonAuditPool();

    const polygonEvents = await polygonAuditPool.queryFilter(
      polygonAuditPool.filters.NewStake(),
      fromPolygonBlock,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // const ethereumChainId = isProduction
    //   ? NetworkType.Ethereum
    //   : NetworkType.EthereumSepolia;

    const polygonChainId = isProduction
      ? NetworkType.Polygon
      : NetworkType.PolygonMumbai;

    const rawEvents = [
      // tokenEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
      polygonEvents.map((event: NewStakeEvent) => ({
        ...event,
        chainId: polygonChainId,
      })),
    ].flat();

    return rawEvents;
  }
}
