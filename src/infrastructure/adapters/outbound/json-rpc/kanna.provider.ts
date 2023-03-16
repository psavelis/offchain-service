import { Contract, ethers, Signer } from 'ethers';
import { KannaPreSale } from './protocol/contracts';
import { KannaPreSale__factory } from './protocol/factories/contracts';

import { Settings } from '../../../../domain/common/settings';
import { JsonRpcProvider } from '@ethersproject/providers';
export interface IKannaProtocolProvider {
  sale(): Promise<KannaPreSale>;
  legacyPreSale(): Promise<KannaPreSale>;
  getDefaultRpcProvider(): JsonRpcProvider;
}

export class KannaProvider implements IKannaProtocolProvider {
  static signersInstance: Signer;
  static saleInstanceAsManager: KannaPreSale;
  static legacyPreSaleInstanceAsManager: KannaPreSale;
  static instance: IKannaProtocolProvider;
  static rpcProvider: JsonRpcProvider;

  private constructor(readonly settings: Settings) {}
  getDefaultRpcProvider(): ethers.providers.JsonRpcProvider {
    return KannaProvider.rpcProvider;
  }

  static getInstance(settings: Settings) {
    if (!KannaProvider.instance) {
      KannaProvider.rpcProvider = new ethers.providers.JsonRpcProvider(
        settings.blockchain.providerEndpoint,
      );

      const claimManagerWallet = new ethers.Wallet(
        settings.blockchain.claimManagerKey,
        KannaProvider.rpcProvider,
      );

      KannaProvider.saleInstanceAsManager = KannaPreSale__factory.connect(
        settings.blockchain.contracts.saleAddress,
        claimManagerWallet,
      );

      KannaProvider.legacyPreSaleInstanceAsManager =
        KannaPreSale__factory.connect(
          settings.blockchain.contracts.legacyPreSaleAddress,
          claimManagerWallet,
        );

      KannaProvider.instance = new KannaProvider(settings);
    }

    return KannaProvider.instance;
  }

  sale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.saleInstanceAsManager);
  }

  legacyPreSale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.legacyPreSaleInstanceAsManager);
  }
}
