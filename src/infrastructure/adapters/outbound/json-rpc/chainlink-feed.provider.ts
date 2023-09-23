import { Contract } from 'ethers';

export interface IChainlinkProtocolProvider {
  getFeed(name: string): Contract;
}

export class ChainlinkFeedProvider implements IChainlinkProtocolProvider {
  static instance: IChainlinkProtocolProvider;
  static dataFeed: Record<string, Contract>;

  static getInstance(
    ethProvide: IChainlinkProtocolProvider,
    polygonProvider: IChainlinkProtocolProvider,
  ) {
    if (!ChainlinkFeedProvider.instance) {
      ChainlinkFeedProvider.dataFeed = {
        ['eth-usd']: ethProvide.getFeed('eth-usd'),
        ['matic-usd']: ethProvide.getFeed('matic-usd'),
        ['matic-eth']: polygonProvider.getFeed('matic-eth'),
        ['brl-usd']: polygonProvider.getFeed('brl-usd'),
      };

      ChainlinkFeedProvider.instance = new ChainlinkFeedProvider();
    }

    return ChainlinkFeedProvider.instance;
  }

  getFeed(name: string): Contract {
    return ChainlinkFeedProvider.dataFeed[name];
  }
}
