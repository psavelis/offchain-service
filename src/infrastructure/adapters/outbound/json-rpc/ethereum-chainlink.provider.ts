import { Contract, ethers } from 'ethers';

import { Settings } from '../../../../domain/common/settings';
import { JsonRpcProvider } from '@ethersproject/providers';
import { aggregatorV3InterfaceABI } from './abi/chainlink-aggregator-v3.abi';

export interface IChainlinkProtocolProvider {
  getFeed(name: string): Promise<Contract>;
}

export class EthereumChainlinkProvider implements IChainlinkProtocolProvider {
  static instance: IChainlinkProtocolProvider;
  static dataFeed: Record<string, Contract>;
  static rpcProvider: JsonRpcProvider;

  private constructor(readonly settings: Settings) {}

  static getInstance(settings: Settings) {
    if (!EthereumChainlinkProvider.instance) {
      EthereumChainlinkProvider.rpcProvider =
        new ethers.providers.JsonRpcProvider(
          settings.blockchain.ethereum.providerEndpoint,
        );

      const ethUsdAddress =
        process.env.NODE_ENV === 'production'
          ? '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
          : '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e';

      // TODO: só possui prod (mockar dev)
      const brlUsdAddress = '0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f';

      EthereumChainlinkProvider.dataFeed = {
        ['eth-usd']: new ethers.Contract(
          ethUsdAddress,
          aggregatorV3InterfaceABI,
          EthereumChainlinkProvider.rpcProvider,
        ),
        ['brl-usd']: new ethers.Contract(
          brlUsdAddress,
          aggregatorV3InterfaceABI,
          EthereumChainlinkProvider.rpcProvider,
        ),
      };

      EthereumChainlinkProvider.instance = new EthereumChainlinkProvider(
        settings,
      );
    }

    return EthereumChainlinkProvider.instance;
  }

  getFeed(name: string): Promise<Contract> {
    return Promise.resolve(EthereumChainlinkProvider.dataFeed[name]);
  }
}
