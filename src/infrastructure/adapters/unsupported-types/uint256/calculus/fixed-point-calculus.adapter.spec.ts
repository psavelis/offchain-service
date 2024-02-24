import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { FixedPointCalculusAdapter } from './fixed-point-calculus.adapter';

describe('FixedPointCalculusAdapter', () => {
  it('should divide currencies with different precision', async () => {
    const adapter =
      FixedPointCalculusAdapter.getInstance() as FixedPointCalculusAdapter;

    const fifthCentsOfUSD: CurrencyAmount = {
      unassignedNumber: '50000000',
      decimals: 8,
      isoCode: 'USD',
    };

    const sampleAmount: CurrencyAmount = {
      unassignedNumber: '1012345',
      decimals: 5,
      isoCode: 'USD',
    };

    const result = adapter.divide(sampleAmount, fifthCentsOfUSD, 'ETH');

    expect(adapter.toFixedNumber(result).toUnsafeFloat()).toBe(10.12345 / 0.5);
  });
});
