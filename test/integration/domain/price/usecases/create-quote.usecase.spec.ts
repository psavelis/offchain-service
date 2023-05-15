import { FixedPointCalculusAdapter } from '../../../../../src/infrastructure/adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { Quote } from '../../../../../src/domain/price/entities/quote.entity';
import { FetchableEthBasisPort } from '../../../../../src/domain/price/ports/fetchable-eth-basis.port';
import { FetchableEthereumGasPricePort } from '../../../../../src/domain/price/ports/fetchable-ethereum-gas-price.port';
import { FetchablePolygonGasPricePort } from '../../../../../src/domain/price/ports/fetchable-polygon-gas-price.port';
import { FetchableKnnBasisPort } from '../../../../../src/domain/price/ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../../../../../src/domain/price/ports/fetchable-usd-basis.port';
import { CurrencyAmount } from '../../../../../src/domain/price/value-objects/currency-amount.value-object';
import { EthQuoteBasis } from '../../../../../src/domain/price/value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../../../../../src/domain/price/value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../../../../../src/domain/price/value-objects/usd-quote-basis.value-object';
import { MaticQuoteBasis } from '../../../../../src/domain/price/value-objects/matic-quote-basis.value-object';
import { CreateQuoteUseCase } from '../../../../../src/domain/price/usecases/create-quote.usecase';
import { Settings } from '../../../../../src/domain/common/settings';
import { PersistableQuotePort } from '../../../../../src/domain/price/ports/persistable-quote.port';
import { FetchableMaticBasisPort } from '../../../../../src/domain/price/ports/fetchable-matic-basis.port';
import { NetworkType } from '../../../../../src/domain/common/enums/network-type.enum';

class FetchableEthBasisMock implements FetchableEthBasisPort {
  fetch(): Promise<EthQuoteBasis> {
    return Promise.resolve({
      BRL: {
        unassignedNumber: '650907',
        decimals: 2,
        isoCode: 'BRL',
      },
      USD: {
        unassignedNumber: '121447',
        decimals: 2,
        isoCode: 'USD',
      },
      expiration: new Date(2066, 10, 10),
    });
  }
}

class FetchableKnnBasisMock implements FetchableKnnBasisPort {
  fetch(): Promise<KnnQuoteBasis> {
    return Promise.resolve({
      ETH: {
        unassignedNumber: '000411702224015414',
        decimals: 18,
        isoCode: 'ETH',
      },
      USD: {
        unassignedNumber: '50000000',
        decimals: 8,
        isoCode: 'USD',
      },
      expiration: new Date(2066, 10, 10),
    });
  }
}

class FetchableUsdBasisMock implements FetchableUsdBasisPort {
  fetch(): Promise<UsdQuoteBasis> {
    return Promise.resolve({
      BRL: {
        unassignedNumber: '53596',
        decimals: 4,
        isoCode: 'BRL',
      },
      expiration: new Date(2066, 10, 10),
    });
  }
}

class FetchableEthereumGasPriceMock implements FetchableEthereumGasPricePort {
  fetch(): Promise<CurrencyAmount> {
    return Promise.resolve({
      unassignedNumber: '14000000000',
      decimals: 18,
      isoCode: 'ETH',
    });
  }
}

class FetchableMaticBasisMock implements FetchableMaticBasisPort {
  fetch(): Promise<KnnQuoteBasis> {
    return Promise.resolve({
      ETH: {
        unassignedNumber: '000411702224015414',
        decimals: 18,
        isoCode: 'ETH',
      },
      USD: {
        unassignedNumber: '50000000',
        decimals: 8,
        isoCode: 'USD',
      },
      expiration: new Date(2066, 10, 10),
    });
  }
}

class FetchablePolygonGasPriceMock implements FetchablePolygonGasPricePort {
  fetch(): Promise<CurrencyAmount> {
    return Promise.resolve({
      unassignedNumber: '14000000000',
      decimals: 18,
      isoCode: 'ETH',
    });
  }
}

class PersistableQuoteMock implements PersistableQuotePort {
  save(quote: Quote): Promise<Quote> {
    return Promise.resolve({ ...quote, id: 'id' });
  }
}

describe('CreateQuoteUseCase', () => {
  const ethAdapter = new FetchableEthBasisMock();
  const knnAdapter = new FetchableKnnBasisMock();
  const usdAdapter = new FetchableUsdBasisMock();
  const maticAdapter = new FetchableMaticBasisMock();
  const ethereumGasAdapter = new FetchableEthereumGasPriceMock();
  const polygonGasAdapter = new FetchablePolygonGasPriceMock();

  const saveQuoteAdapter = new PersistableQuoteMock();

  const usecase = new CreateQuoteUseCase(
    {
      price: {
        quoteExpirationSeconds: +Infinity,
      },
    } as Settings,
    ethAdapter,
    knnAdapter,
    usdAdapter,
    maticAdapter,
    ethereumGasAdapter,
    polygonGasAdapter,
    FixedPointCalculusAdapter.getInstance(),
    saveQuoteAdapter,
  );

  it('should calculate a given USD amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '60000',
        decimals: 2,
        isoCode: 'USD',
      },
      chainId: NetworkType.EthereumGoerli,
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('1197024208448399999052');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given BRL amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '60000',
        decimals: 2,
        isoCode: 'BRL',
      },
      chainId: NetworkType.EthereumGoerli,
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('220921514217487244368');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given ETH amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '041170222401541400',
        decimals: 18,
        isoCode: 'ETH',
      },
      chainId: NetworkType.EthereumGoerli,
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('100000000000000000000');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given ETH amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '1',
        decimals: 0,
        isoCode: 'ETH',
      },
      chainId: NetworkType.EthereumGoerli,
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('2428940000000000774443');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given KNN amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '1000',
        decimals: 0,
        isoCode: 'KNN',
      },
      chainId: NetworkType.PolygonMumbai,
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('1000');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(0);
  });
});
