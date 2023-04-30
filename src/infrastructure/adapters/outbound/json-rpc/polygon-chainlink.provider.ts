import { Contract, ethers } from 'ethers';

import { Settings } from '../../../../domain/common/settings';
import { JsonRpcProvider } from '@ethersproject/providers';
import { aggregatorV3InterfaceABI } from './abi/chainlink-aggregator-v3.abi';

export interface IChainlinkProtocolProvider {
  getFeed(name: string): Promise<Contract>;
}

export class PolygonChainlinkProvider implements IChainlinkProtocolProvider {
  static instance: IChainlinkProtocolProvider;
  static dataFeed: Record<string, Contract>;
  static rpcProvider: JsonRpcProvider;

  private constructor(readonly settings: Settings) {}

  static getInstance(settings: Settings) {
    if (!PolygonChainlinkProvider.instance) {
      PolygonChainlinkProvider.rpcProvider =
        new ethers.providers.JsonRpcProvider(
          settings.blockchain.polygon.providerEndpoint,
        );

      const maticUsdAddress =
        process.env.NODE_ENV === 'production'
          ? '0xab594600376ec9fd91f8e885dadf0ce036862de0' // polygonmainnet: https://data.chain.link/polygon/mainnet/crypto-usd/matic-usd
          : '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'; // mumbai: https://docs.chain.link/data-feeds/price-feeds/addresses/?network=polygon

      const maticEthAddress = '0x327e23a4855b6f663a28c5161541d69af8973302'; //https://data.chain.link/polygon/mainnet/crypto-eth/matic-eth

      PolygonChainlinkProvider.dataFeed = {
        ['matic-usd']: new ethers.Contract(
          maticUsdAddress,
          aggregatorV3InterfaceABI,
          PolygonChainlinkProvider.rpcProvider,
        ),
        ['matic-eth']: new ethers.Contract(
          maticEthAddress,
          aggregatorV3InterfaceABI,
          PolygonChainlinkProvider.rpcProvider,
        ),
      };

      PolygonChainlinkProvider.instance = new PolygonChainlinkProvider(
        settings,
      );
    }

    return PolygonChainlinkProvider.instance;
  }

  getFeed(name: string): Promise<Contract> {
    return Promise.resolve(PolygonChainlinkProvider.dataFeed[name]);
  }
}
