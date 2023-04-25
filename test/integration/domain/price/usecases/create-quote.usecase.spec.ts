import { FixedPointCalculusAdapter } from '../../../../../src/infrastructure/adapters/outbound/bignumbers/calculus/fixed-point-calculus.adapter';
import { Quote } from '../../../../../src/domain/price/entities/quote.entity';
import { FetchableEthBasisPort } from '../../../../../src/domain/price/ports/fetchable-eth-basis.port';
import { FetchableGasPricePort } from '../../../../../src/domain/price/ports/fetchable-gas-price.port';
import { FetchableKnnBasisPort } from '../../../../../src/domain/price/ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../../../../../src/domain/price/ports/fetchable-usd-basis.port';
import { CurrencyAmount } from '../../../../../src/domain/price/value-objects/currency-amount.value-object';
import { EthQuoteBasis } from '../../../../../src/domain/price/value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../../../../../src/domain/price/value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../../../../../src/domain/price/value-objects/usd-quote-basis.value-object';
import { CreateQuoteUseCase } from '../../../../../src/domain/price/usecases/create-quote.usecase';
import { Settings } from '../../../../../src/domain/common/settings';
import { PersistableQuotePort } from '../../../../../src/domain/price/ports/persistable-quote.port';

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

class FetchableGasPriceMock implements FetchableGasPricePort {
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
  const gasAdapter = new FetchableGasPriceMock();
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
    gasAdapter,
    FixedPointCalculusAdapter.getInstance(),
    saveQuoteAdapter,
  );

  it('should calculate a given USD amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '50000',
        decimals: 2,
        isoCode: 'USD',
      },
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('997024208448399999052');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given BRL amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '50000',
        decimals: 2,
        isoCode: 'BRL',
      },
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('183605296589306036816');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given ETH amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '000411702224015414',
        decimals: 18,
        isoCode: 'ETH',
      },
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('1000000000000000000');
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
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('2428940000000000774443');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(18);
  });

  it('should calculate a given KNN amount', async () => {
    const quote: Quote = await usecase.execute({
      amount: {
        unassignedNumber: '1',
        decimals: 0,
        isoCode: 'KNN',
      },
    });

    const { finalAmountOfTokens } = quote;

    expect(finalAmountOfTokens.unassignedNumber).toBe('1');
    expect(finalAmountOfTokens.isoCode).toBe('KNN');
    expect(finalAmountOfTokens.decimals).toBe(0);
  });
});
