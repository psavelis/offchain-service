import { Chain } from '../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../domain/common/enums/network-type.enum';
import { Settings } from '../../../../domain/common/settings';
import { IKannaProtocolProvider } from '../kanna.provider';
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
    };

    const provider = {
      sale: jest.fn(),
      polygonSale: jest.fn(),
      dynamicPolygonSale: jest.fn(),
      dynamicSale: jest.fn(),
    };

    const adapter = LockSupplyRpcAdapter.getInstance(
      settings as Settings,
      provider as Partial<IKannaProtocolProvider> as IKannaProtocolProvider,
    ) as LockSupplyRpcAdapter;

    await adapter.toggleNetworkContract(new Chain(NetworkType.Polygon));

    expect(provider.dynamicPolygonSale).toBeCalled();
  });
});
