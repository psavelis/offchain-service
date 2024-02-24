import { ethers, type Contract } from 'ethers';

import { type JsonRpcProvider } from '@ethersproject/providers';
import { type Settings } from '../../../domain/common/settings';
import { aggregatorV3InterfaceABI } from './abi/chainlink-aggregator-v3.abi';

export type IChainlinkProtocolProvider = {
  getFeed(name: string): Contract;
};

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

      const isProd = process.env.NODE_ENV === 'production';

      const maticUsdAddress = isProd
        ? '0xab594600376ec9fd91f8e885dadf0ce036862de0' // polygonmainnet: https://data.chain.link/polygon/mainnet/crypto-usd/matic-usd
        : '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'; // mumbai: https://docs.chain.link/data-feeds/price-feeds/addresses/?network=polygon

      const maticEthAddress = isProd
        ? '0x327e23a4855b6f663a28c5161541d69af8973302' //https://data.chain.link/polygon/mainnet/crypto-eth/matic-eth
        : '0x8106d642b15a27bfecfc71f2e94a21159dca2462'; // mumbai: AggregatorV3Mock.sol

      const brlUsdAddress = '0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c';

      PolygonChainlinkProvider.dataFeed = {
        //
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
        ['brl-usd']: new ethers.Contract(
          brlUsdAddress,
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

  getFeed(name: string): Contract {
    return PolygonChainlinkProvider.dataFeed[name];
  }
}
