import { FetchableEthBasisHttpAdapter } from './fetchable-eth-basis.adapter';

describe('FetchableEthBasisHttpAdapter', () => {
  it('should fetch eth->brl basis quotation from http api', async () => {
    const adapter = FetchableEthBasisHttpAdapter.getInstance();

    const {
      BRL: { unassignedNumber, isoCode, decimals },
      expiration,
    } = await adapter.fetch();

    if (unassignedNumber.length === 18) {
      console.log(unassignedNumber);
    }

    expect(unassignedNumber.length).toBe(6);
    expect(isoCode).toBe('BRL');
    expect(decimals).toBe(2);
    expect(expiration.getTime()).toBeGreaterThan(new Date().getTime());
  });

  it('should fetch eth->usd basis quotation from http api', async () => {
    const adapter = FetchableEthBasisHttpAdapter.getInstance();

    const {
      USD: { unassignedNumber, isoCode, decimals },
      expiration,
    } = await adapter.fetch();

    if (unassignedNumber.length === 18) {
      console.log(unassignedNumber);
    }

    expect(unassignedNumber.length).toBe(6);
    expect(isoCode).toBe('USD');
    expect(decimals).toBe(2);
    expect(expiration.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
