import { ethers, Signer } from 'ethers';
import { KannaPreSale } from './protocol/contracts';
import { KannaPreSale__factory } from './protocol/factories/contracts';

import { Settings } from '../../../../domain/common/settings';
export interface IKannaProtocolProvider {
  preSale(): Promise<KannaPreSale>;
}

export class KannaProvider implements IKannaProtocolProvider {
  static signersInstance: Signer;
  static presaleInstance: KannaPreSale;
  static instance: IKannaProtocolProvider;

  private constructor(readonly settings: Settings) {}

  static getInstance(settings: Settings) {
    if (!KannaProvider.instance) {
      const provider = new ethers.providers.JsonRpcProvider(
        settings.blockchain.providerEndpoint,
      );

      const claimManagerWallet = new ethers.Wallet(
        settings.blockchain.claimManagerKey,
        provider,
      );

      KannaProvider.presaleInstance = KannaPreSale__factory.connect(
        settings.blockchain.contracts.preSaleAddress,
        claimManagerWallet,
      );

      KannaProvider.instance = new KannaProvider(settings);
    }

    return KannaProvider.instance;
  }

  preSale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.presaleInstance);
  }
}
