import { Chain } from '../../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { LockSupplyRpcAdapter } from './lock-supply.adapter';

describe('LockSupplyRpcAdapter', () => {
  afterAll(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });
  it('should retrieve the correct contract for L2', async () => {
    process.env.NODE_ENV = 'production';
    const settings = {
      blockchain: {
        current: {
          layer: LayerType.L2,
        },
      },
    } as any;

    const provider = {
      sale: jest.fn(),
      polygonSale: jest.fn(),
    } as any;

    const adapter = LockSupplyRpcAdapter.getInstance(
      settings,
      provider,
    ) as LockSupplyRpcAdapter;

    await adapter.toggleNetworkContract(new Chain(NetworkType.Polygon));

    expect(provider.polygonSale).toBeCalled();
  });
});
