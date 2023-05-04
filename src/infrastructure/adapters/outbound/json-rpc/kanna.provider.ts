import { ethers, Signer } from 'ethers';
import { KannaPreSale, KannaBadges } from './protocol/contracts';
import {
  KannaPreSale__factory,
  KannaBadges__factory,
} from './protocol/factories/contracts';

import { Settings } from '../../../../domain/common/settings';
import { JsonRpcProvider } from '@ethersproject/providers';
export interface IKannaProtocolProvider {
  sale(): Promise<KannaPreSale>;
  legacyPreSale(): Promise<KannaPreSale>;
  polygonSale(): Promise<KannaPreSale>;
  badges(): Promise<KannaBadges>;
  getDefaultRpcProvider(): JsonRpcProvider;
}

export class KannaProvider implements IKannaProtocolProvider {
  static signersInstance: Signer;
  static ethereumSaleInstanceAsManager: KannaPreSale;
  static ethereumLegacyPreSaleInstanceAsManager: KannaPreSale;
  static ethereumBadgeInstanceAsManager: KannaBadges;
  static polygonSaleInstanceAsManager: KannaPreSale;
  static instance: IKannaProtocolProvider;
  static ethereumRpcProvider: JsonRpcProvider;
  static polygonRpcProvider: JsonRpcProvider;

  private constructor(readonly settings: Settings) {}

  getDefaultRpcProvider(): ethers.providers.JsonRpcProvider {
    return KannaProvider.ethereumRpcProvider;
  }

  static getInstance(settings: Settings) {
    if (!KannaProvider.instance) {
      KannaProvider.ethereumRpcProvider = new ethers.providers.JsonRpcProvider(
        settings.blockchain.ethereum.providerEndpoint,
      );

      KannaProvider.polygonRpcProvider = new ethers.providers.JsonRpcProvider(
        settings.blockchain.polygon.providerEndpoint,
      );

      const ethereumClaimManagerWallet = new ethers.Wallet(
        settings.blockchain.ethereum.claimManagerKey,
        KannaProvider.ethereumRpcProvider,
      );

      const polygonClaimManagerWallet = new ethers.Wallet(
        settings.blockchain.polygon.claimManagerKey,
        KannaProvider.polygonRpcProvider,
      );

      KannaProvider.ethereumSaleInstanceAsManager =
        KannaPreSale__factory.connect(
          settings.blockchain.ethereum.contracts.saleAddress,
          ethereumClaimManagerWallet,
        );

      KannaProvider.ethereumLegacyPreSaleInstanceAsManager =
        KannaPreSale__factory.connect(
          settings.blockchain.ethereum.contracts.legacyPreSaleAddress,
          ethereumClaimManagerWallet,
        );

      KannaProvider.ethereumBadgeInstanceAsManager =
        KannaBadges__factory.connect(
          settings.blockchain.ethereum.contracts.badgeAddress,
          polygonClaimManagerWallet,
        );

      KannaProvider.polygonSaleInstanceAsManager =
        KannaPreSale__factory.connect(
          settings.blockchain.ethereum.contracts.saleAddress,
          ethereumClaimManagerWallet,
        );

      KannaProvider.instance = new KannaProvider(settings);
    }

    return KannaProvider.instance;
  }

  sale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.ethereumSaleInstanceAsManager);
  }

  legacyPreSale(): Promise<KannaPreSale> {
    return Promise.resolve(
      KannaProvider.ethereumLegacyPreSaleInstanceAsManager,
    );
  }

  badges(): Promise<KannaBadges> {
    return Promise.resolve(KannaProvider.ethereumBadgeInstanceAsManager);
  }

  polygonSale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.polygonSaleInstanceAsManager);
  }
}
