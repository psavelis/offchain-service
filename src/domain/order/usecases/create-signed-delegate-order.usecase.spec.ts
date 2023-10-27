import { CreateSignedDelegateOrderUseCase } from './create-signed-delegate-order.usecase';
import { CreateQuoteDto } from '../../price/dtos/create-quote.dto';
import { QuotationAggregate } from '../../price/value-objects/quotation-aggregate.value-object';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { NetworkType } from '../../common/enums/network-type.enum';

jest.mock('../../price/interactors/create-quote.interactor');
jest.mock('../../../domain/common/ports/signature.port');
jest.mock('../../common/ports/loggable.port');
jest.mock('../../price/interactors/knn-to-currencies.interactor');
jest.mock('../ports/estimate-delegate-order.port');
jest.mock('../ports/fetchable-nonce-and-expiration.port');

describe('CreateSignedDelegateOrderUseCase', () => {
  let useCase: CreateSignedDelegateOrderUseCase;
  const mockFetchableNonceAndExpiration = { fetch: jest.fn() };
  const mockSignaturePort = { sign: jest.fn() } as any;
  const mockLogger = { error: jest.fn() } as any;
  const mockKnnToCurrenciesInteractor = {
    execute: jest.fn().mockImplementation(() => {
      return {
        execute: jest.fn(),
      };
    }),
  } as any;
  const mockEstimateDelegateOrder = { execute: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new CreateSignedDelegateOrderUseCase(
      mockCreateQuoteInteractor,
      mockFetchableNonceAndExpiration,
      mockSignaturePort,
      mockLogger,
      mockKnnToCurrenciesInteractor,
      mockEstimateDelegateOrder,
    );
  });

  it('should execute successfully', async () => {
    const mockInput: CreateQuoteDto & { cryptoWallet: string } = {
      cryptoWallet: 'mockCryptoWallet',
      chainId: NetworkType.EthereumSepolia,
      amount: {
        isoCode: IsoCodeType.ETH,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
      transactionType: 'Transfer',
    };

    mockFetchableNonceAndExpiration.fetch.mockResolvedValueOnce({
      dueDate: 'mockDueDate',
      incrementalNonce: 'mockIncrementalNonce',
    });

    mockSignaturePort.sign.mockResolvedValueOnce({
      signature: 'mockSignature',
      nonce: 'mockNonce',
    });

    mockEstimateDelegateOrder.execute.mockResolvedValueOnce('mockGasEstimate');

    const result = await useCase.execute(mockInput);

    expect(result).toBeDefined();
    expect(result.signature).toBe('mockSignature');
    expect(result.nonce).toBe('mockNonce');
    expect(result.gasEstimate).toBe('mockGasEstimate');
    expect(result.total.ETH.unassignedNumber).toBe(
      mockInput.amount.unassignedNumber,
    );
    expect(result.total.ETH.decimals).toBe(mockInput.amount.decimals);
    expect(result.total.ETH.isoCode).toBe(mockInput.amount.isoCode);
  });
});

const mockCreateQuoteInteractor = {
  execute: jest.fn().mockResolvedValue({
    total: {
      ETH: {
        isoCode: IsoCodeType.ETH,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
      KNN: {
        isoCode: IsoCodeType.KNN,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
      USD: {
        isoCode: IsoCodeType.USD,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
      BRL: {
        isoCode: IsoCodeType.BRL,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
      MATIC: {
        isoCode: IsoCodeType.MATIC,
        unassignedNumber: '1000000000000000000',
        decimals: 18,
      },
    },
  }),
} as any;
