import {IsoCodeType} from '../enums/iso-codes.enum';
import {LayerType} from '../enums/layer-type.enum';
import {NetworkType} from '../enums/network-type.enum';

const networkLayer = {
  [NetworkType.Ethereum]: LayerType.L1,
  [NetworkType.Polygon]: LayerType.L2,

  // experimental
  [NetworkType.PolygonzkEVM]: LayerType.L1,

  // testnets
  [NetworkType.EthereumSepolia]: LayerType.L1,
  [NetworkType.PolygonMumbai]: LayerType.L2,

  // experimental
  [NetworkType.PolygonzkEVMTestnet]: LayerType.L2,
};

const networkCurrency = {
  [NetworkType.Ethereum]: IsoCodeType.ETH,
  [NetworkType.Polygon]: IsoCodeType.MATIC,

  // experimental
  [NetworkType.PolygonzkEVM]: IsoCodeType.ETH,

  // testnets
  [NetworkType.EthereumSepolia]: IsoCodeType.ETH,
  [NetworkType.PolygonMumbai]: IsoCodeType.MATIC,

  // experimental
  [NetworkType.PolygonzkEVMTestnet]: IsoCodeType.ETH,
};

const testnets = [NetworkType.EthereumSepolia, NetworkType.PolygonMumbai];

export class Chain {
  constructor(readonly chainId: NetworkType) {
    if (!chainId) {
      throw new Error('ChainId not defined');
    }

    if (!Object.values(NetworkType).includes(chainId)) {
      throw new Error(`Network '${chainId}' not supported`);
    }

    const environment = process.env.NODE_ENV;

    const isProductionToMainnet =
      environment === 'production' && !this.isTestnet;

    const isDevelopmentToTestnet =
      (environment === 'development' || environment === 'test') &&
      this.isTestnet;

    if (
      !isProductionToMainnet &&
      !isDevelopmentToTestnet &&
      process.env.ALLOW_DEBUG_PROD !== 'true'
    ) {
      const errorMessage = `Wrong network targeting (NODE_ENV: ${environment} to ChainID: ${
        NetworkType[this.chainId]
      })`;

      throw new Error(errorMessage);
    }
  }

  get id(): NetworkType {
    return this.chainId;
  }

  get layer(): LayerType {
    return networkLayer[this.chainId];
  }

  get currency(): IsoCodeType {
    return networkCurrency[this.chainId];
  }

  get isTestnet(): boolean {
    return testnets.includes(this.chainId);
  }

  public toJSON(): string {
    const obj = Object.assign(this);
    const keys = Object.keys(this.constructor.prototype);
    obj.toJSON = undefined;
    return JSON.stringify(obj, keys);
  }

  public getBlockExplorerUrl(txnHash: string) {
    if (this.layer === LayerType.L1) {
      return `https://${
        process.env.NODE_ENV === 'production' ? '' : 'sepolia.'
      }etherscan.io/tx/${txnHash}`;
    } else if (this.layer === LayerType.L2) {
      return `https://${
        process.env.NODE_ENV === 'production' ? '' : 'mumbai.'
      }polygonscan.com/tx/${txnHash}`;
    }
  }
}
