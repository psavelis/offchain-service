import { Contract } from 'ethers';

export interface IChainlinkProtocolProvider {
  getFeed(name: string): Contract;
}

export class MultichainChainlinkProvider implements IChainlinkProtocolProvider {
  static instance: IChainlinkProtocolProvider;
  static dataFeed: Record<string, Contract>;

  static getInstance(ethProvide: IChainlinkProtocolProvider, polygonProvider: IChainlinkProtocolProvider) {
    if (!MultichainChainlinkProvider.instance) {
      MultichainChainlinkProvider.dataFeed = {
        ['eth-usd']: ethProvide.getFeed('eth-usd'),
        ['matic-usd']: ethProvide.getFeed('matic-usd'),
        ['matic-eth']: polygonProvider.getFeed('matic-eth'),
        ['brl-usd']: polygonProvider.getFeed('brl-usd')
      };

      MultichainChainlinkProvider.instance = new MultichainChainlinkProvider();
    }

    return MultichainChainlinkProvider.instance;
  }

  getFeed(name: string): Contract {
    return MultichainChainlinkProvider.dataFeed[name];
  }
}
