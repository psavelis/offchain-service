import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { NetworkType } from '../../common/enums/network-type.enum';
import { LoggablePort } from '../../common/ports/loggable.port';
import {
  Order,
  OrderStatus,
  PaymentOption,
} from '../../order/entities/order.entity';
import { FetchableOrderPort } from '../../order/ports/fetchable-order.port';
import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';
import { OnChainUserReceipt } from '../dtos/onchain-user-receipt.dto';
import { FetchableDelegateClaimEventPort } from '../ports/fetchable-delegate-claim-event.port';
import { ReconcileDelegateSignatureClaimUseCase } from './reconcile-delegate-signature-claim.usecase';

describe('ReconcileDelegateSignatureClaimUseCase', () => {
  let usecase: ReconcileDelegateSignatureClaimUseCase;
  let loggerMock: LoggablePort;
  let fetchableDelegateClaimEventPortMock: FetchableDelegateClaimEventPort;
  let fetchableOrderPortMock: FetchableOrderPort;
  let order1: Order;
  let order2: Order;
  let event1: OnChainUserReceipt;
  let event2: OnChainUserReceipt;

  beforeEach(() => {
    jest.clearAllMocks();

    loggerMock = {
      warning: jest.fn(),
    } as any;

    event1 = {
      chainId: NetworkType.Ethereum,
      cryptoWallet: '0x123',
      paymentSequence: 1,
      amountInKnn: 50.5,
      blockNumber: 123456789,
      transactionHash: '0x123456789',
      from: '0x123',
      to: '0x234',
      gasUsed: 30_000,
      cumulativeGasUsed: 30_000,
      effectiveGasPrice: 1_000_000,
    };

    event2 = {
      chainId: NetworkType.Ethereum,
      cryptoWallet: '0x555',
      paymentSequence: 2,
      amountInKnn: 60.5,
      blockNumber: 123456789,
      transactionHash: '0x123456789',
      from: '0x555',
      to: '0x234',
      gasUsed: 30_000,
      cumulativeGasUsed: 30_000,
      effectiveGasPrice: 1_000_000,
    };

    fetchableDelegateClaimEventPortMock = {
      fetch: jest.fn().mockResolvedValue([event1, event2]),
    };

    order1 = new Order({
      paymentOption: PaymentOption.BrazilianPix,
      isoCode: IsoCodeType.BRL,
      total: 600,
      totalGas: 10,
      totalNet: 590,
      totalKnn: 50.5,
      amountOfTokens: {} as any,
      userIdentifier: 'tech@kannacoin.io',
      identifierType: 'EA',
      endToEndId: 'QWERTSDZXC',
      status: OrderStatus.Owned,
      desiredChainId: NetworkType.Ethereum,
    });

    order1.setPaymentSequence(1);

    order2 = new Order({
      paymentOption: PaymentOption.BrazilianPix,
      isoCode: IsoCodeType.BRL,
      total: 600,
      totalGas: 10,
      totalNet: 590,
      totalKnn: 60.5,
      amountOfTokens: {} as CurrencyAmount,
      userIdentifier: 'tech@kannacoin.io',
      identifierType: 'EA',
      endToEndId: 'ZWZRTSDZXZ',
      status: OrderStatus.Owned,
      desiredChainId: NetworkType.Ethereum,
    });

    order2.setPaymentSequence(2);

    fetchableOrderPortMock = {
      fetchLockedAndNotClaimedInStatus: jest.fn().mockResolvedValue({
        ['QWERTSDZXC']: order1,
        ['ZWZRTSDZXZ']: order2,
      }),
    } as any;

    usecase = new ReconcileDelegateSignatureClaimUseCase(
      loggerMock,
      fetchableDelegateClaimEventPortMock,
      fetchableOrderPortMock,
    );
  });

  it('should reconcile Orders and OnChainUserReceipts', async () => {
    const result = await usecase.execute();

    expect(loggerMock.warning).not.toHaveBeenCalled();

    expect(result.length).toEqual(2);
  });

  it('should reconcile Orders and OnChainUserReceipts warning for wrong amount', async () => {
    event2.amountInKnn = 60.6;
    const result = await usecase.execute();

    expect(loggerMock.warning).toHaveBeenCalled();

    expect(result.length).toEqual(1);
  });
});
