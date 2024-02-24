import { FetchableUsdBasisHttpAdapter } from './fetchable-usd-basis.adapter';

describe('FetchableUsdBasisHttpAdapter', () => {
  it('should fetch usd->brl basis quotation from http api', async () => {
    const adapter = FetchableUsdBasisHttpAdapter.getInstance();

    const {
      BRL: { unassignedNumber, isoCode, decimals },
      expiration,
    } = await adapter.fetch();

    expect(unassignedNumber.length).toBe(5);
    expect(isoCode).toBe('BRL');
    expect(decimals).toBe(4);
    expect(expiration.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
