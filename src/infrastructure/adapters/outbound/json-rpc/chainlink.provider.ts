import { Contract, ethers, Signer } from 'ethers';

import { Settings } from '../../../../domain/common/settings';
import { JsonRpcProvider } from '@ethersproject/providers';

export interface IChainlinkProtocolProvider {
  getFeed(name: string): Promise<Contract>;
}

export class ChainlinkProvider implements IChainlinkProtocolProvider {
  static instance: IChainlinkProtocolProvider;
  static dataFeed: Record<string, Contract>;
  static rpcProvider: JsonRpcProvider;

  private constructor(readonly settings: Settings) {}

  static getInstance(settings: Settings) {
    if (!ChainlinkProvider.instance) {
      ChainlinkProvider.rpcProvider = new ethers.providers.JsonRpcProvider(
        settings.blockchain.providerEndpoint,
      );

      const ethUsdAddress =
        process.env.NODE_ENV === 'production'
          ? '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
          : '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e';

      // TODO: só possui prod (mockar dev)
      const brlUsdAddress = '0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f';

      ChainlinkProvider.dataFeed = {
        ['eth-usd']: new ethers.Contract(
          ethUsdAddress,
          aggregatorV3InterfaceABI,
          ChainlinkProvider.rpcProvider,
        ),
        ['brl-usd']: new ethers.Contract(
          brlUsdAddress,
          aggregatorV3InterfaceABI,
          ChainlinkProvider.rpcProvider,
        ),
      };

      ChainlinkProvider.instance = new ChainlinkProvider(settings);
    }

    return ChainlinkProvider.instance;
  }

  getFeed(name: string): Promise<Contract> {
    return Promise.resolve(ChainlinkProvider.dataFeed[name]);
  }
}

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
