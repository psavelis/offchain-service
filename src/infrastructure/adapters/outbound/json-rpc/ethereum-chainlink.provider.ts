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

      const isProd = process.env.NODE_ENV === 'production';

      const ethUsdAddress = isProd
        ? '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
        : '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e';

      const brlUsdAddress = isProd
        ? '0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f'
        : '0xCFC3ee30210FB8da6DAc991A8B8Bde6d87E778dA'; // AggregatorV3Mock.sol

      const maticUsdAddress = isProd
        ? '0x7bac85a8a13a4bcd8abb3eb7d6b4d632c5a57676' // matic-usd.data.eth (https://data.chain.link/ethereum/mainnet/crypto-usd/matic-usd)
        : '0x45bAB8f7CB34DE3Ae39708403568b6adC3e3D6d4'; // AggregatorV3Mock.sol

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
        ['matic-usd']: new ethers.Contract(
          maticUsdAddress,
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
