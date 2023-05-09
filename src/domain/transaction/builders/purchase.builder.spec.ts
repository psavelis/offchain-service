import { PurchaseBuilder } from './purchase.builder';

describe('PurchaseEntityBuilder', () => {
  it('build a ETH purchase', async () => {
    const builder = new PurchaseBuilder(
      '0x1234',
      '0x5678',
      1,
      '0x123',
      50000000,
      100021200000000000000,
      81822,
      19305910085,
      19305910085,
      1,
    );
    builder.eth(
      147090000000,
      34000000000000000,
      new Date('2023-05-08T19:30:17.575Z'),
    );

    const result = builder.build();

    expect(result.paymentDate).toEqual(new Date('2023-05-08T19:30:17.575Z'));
    expect(result.network).toEqual('Ethereum');
    expect(result.ethereumBlockNumber).toEqual(1);

    expect(result.ethPriceInUsd).toEqual(1470.9);
    expect(result.knnPriceInUsd).toEqual(0.5);
    expect(result.totalEth).toEqual(0.034);
    expect(result.totalGasEth).toEqual(0.00157964817497487);
    expect(result.totalGasUsd).toEqual(2.323504500570536);
    expect(result.totalKnn).toEqual(100.0212);
    expect(result.totalUsd).toEqual(50.0106);
  });

  it('build a MATIC purchase', async () => {
    const builder = new PurchaseBuilder(
      '0x1234',
      '0x5678',
      137,
      '0x123',
      50000000,
      100021200000000000000,
      81822,
      19305910085,
      19305910085,
      1,
    );

    builder.matic(
      147090000000,
      34000000000000000,
      new Date('2023-05-08T19:30:17.575Z'),
    );

    const result = builder.build();

    expect(result.paymentDate).toEqual(new Date('2023-05-08T19:30:17.575Z'));
    expect(result.network).toEqual('Polygon');
    expect(result.polygonBlockNumber).toEqual(1);

    expect(result.maticPriceInUsd).toEqual(1470.9);
    expect(result.knnPriceInUsd).toEqual(0.5);
    expect(result.totalMatic).toEqual(0.034);
    expect(result.totalGasMatic).toEqual(0.00157964817497487);
    expect(result.totalGasUsd).toEqual(2.323504500570536);
    expect(result.totalKnn).toEqual(100.0212);
    expect(result.totalUsd).toEqual(50.0106);
  });
});
