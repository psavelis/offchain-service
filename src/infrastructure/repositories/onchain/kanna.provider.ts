import { ethers, type Signer } from 'ethers';
import {
  type KannaAuditStakePool,
  type KannaBadges,
  type KannaDynamicPriceSale,
  type KannaPreSale,
} from './protocol/contracts';
import {
  KannaAuditStakePool__factory,
  KannaBadges__factory,
  KannaDynamicPriceSale__factory,
  KannaPreSale__factory,
} from './protocol/factories/contracts';

import { type JsonRpcProvider } from '@ethersproject/providers';
import { type Settings } from '../../../domain/common/settings';

import { type ERC20 } from './protocol/@openzeppelin/contracts/token/ERC20/ERC20';
import { ERC20__factory } from './protocol/factories/@openzeppelin/contracts/token/ERC20';

export type IKannaProtocolProvider = {
  dynamicSale(): Promise<KannaDynamicPriceSale>;
  dynamicPolygonSale(): Promise<KannaDynamicPriceSale>;

  sale(): Promise<KannaPreSale>;
  legacyPreSale(): Promise<KannaPreSale>;
  polygonSale(): Promise<KannaPreSale>;

  badges(): Promise<KannaBadges>;
  polygonBadges(): Promise<KannaBadges>;

  token(): Promise<ERC20>;
  tokenPolygon(): Promise<ERC20>;

  auditPool(): Promise<KannaAuditStakePool>;
  polygonAuditPool(): Promise<KannaAuditStakePool>;

  getDefaultRpcProvider(): JsonRpcProvider;
};

export class KannaProvider implements IKannaProtocolProvider {
  static signersInstance: Signer;
  static ethereumSaleInstanceAsManager: KannaPreSale;
  static ethereumLegacyPreSaleInstanceAsManager: KannaPreSale;
  static ethereumBadgeInstanceAsManager: KannaBadges;
  static polygonBadgeInstanceAsManager: KannaBadges;
  static polygonSaleInstanceAsManager: KannaPreSale;
  static ethereumDynamicSaleInstanceAsManager: KannaDynamicPriceSale;
  static polygonDynamicSaleInstanceAsManager: KannaDynamicPriceSale;
  static instance: IKannaProtocolProvider;
  static ethereumRpcProvider: JsonRpcProvider;
  static polygonRpcProvider: JsonRpcProvider;
  static ethereumTokenInstanceAsManager: ERC20;
  static polygonTokenInstanceAsManager: ERC20;
  static ethereumAuditPoolInstanceAsManager: KannaAuditStakePool;
  static polygonAuditPoolInstanceAsManager: KannaAuditStakePool;

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

      const ethereumBadgeManagerWallet = new ethers.Wallet(
        settings.blockchain.ethereum.badgesMinterSignerKey,
        KannaProvider.ethereumRpcProvider,
      );

      const polygonBadgeManagerWallet = new ethers.Wallet(
        settings.blockchain.polygon.badgesMinterSignerKey,
        KannaProvider.polygonRpcProvider,
      );

      const ethereumDynamicSaleClaimManagerWallet = new ethers.Wallet(
        settings.blockchain.ethereum.dynamicSaleClaimsManagerKey,
        KannaProvider.ethereumRpcProvider,
      );

      const polygonDynamicSaleClaimManagerWallet = new ethers.Wallet(
        settings.blockchain.polygon.dynamicSaleClaimsManagerKey,
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
          ethereumBadgeManagerWallet,
        );

      KannaProvider.polygonBadgeInstanceAsManager =
        KannaBadges__factory.connect(
          settings.blockchain.polygon.contracts.badgeAddress,
          polygonBadgeManagerWallet,
        );

      KannaProvider.polygonSaleInstanceAsManager =
        KannaPreSale__factory.connect(
          settings.blockchain.polygon.contracts.saleAddress,
          polygonClaimManagerWallet,
        );

      KannaProvider.ethereumTokenInstanceAsManager = ERC20__factory.connect(
        settings.blockchain.ethereum.contracts.tokenAddress,
        ethereumClaimManagerWallet,
      );

      KannaProvider.polygonTokenInstanceAsManager = ERC20__factory.connect(
        settings.blockchain.polygon.contracts.fxTokenAddress,
        polygonClaimManagerWallet,
      );

      KannaProvider.ethereumDynamicSaleInstanceAsManager =
        KannaDynamicPriceSale__factory.connect(
          settings.blockchain.ethereum.contracts.dynamicSaleAddress,
          ethereumDynamicSaleClaimManagerWallet,
        );

      KannaProvider.polygonDynamicSaleInstanceAsManager =
        KannaDynamicPriceSale__factory.connect(
          settings.blockchain.polygon.contracts.dynamicSaleAddress,
          polygonDynamicSaleClaimManagerWallet,
        );

      KannaProvider.ethereumAuditPoolInstanceAsManager =
        KannaAuditStakePool__factory.connect(
          settings.blockchain.ethereum.contracts.auditPoolAddress,
          ethereumClaimManagerWallet,
        );

      KannaProvider.polygonAuditPoolInstanceAsManager =
        KannaAuditStakePool__factory.connect(
          settings.blockchain.polygon.contracts.auditPoolAddress,
          polygonClaimManagerWallet,
        );

      KannaProvider.instance = new KannaProvider(settings);
    }

    return KannaProvider.instance;
  }

  async sale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.ethereumSaleInstanceAsManager);
  }

  async legacyPreSale(): Promise<KannaPreSale> {
    return Promise.resolve(
      KannaProvider.ethereumLegacyPreSaleInstanceAsManager,
    );
  }

  async dynamicSale(): Promise<KannaDynamicPriceSale> {
    return Promise.resolve(KannaProvider.ethereumDynamicSaleInstanceAsManager);
  }

  async dynamicPolygonSale(): Promise<KannaDynamicPriceSale> {
    return Promise.resolve(KannaProvider.polygonDynamicSaleInstanceAsManager);
  }

  async badges(): Promise<KannaBadges> {
    return Promise.resolve(KannaProvider.ethereumBadgeInstanceAsManager);
  }

  async polygonBadges(): Promise<KannaBadges> {
    return Promise.resolve(KannaProvider.polygonBadgeInstanceAsManager);
  }

  async polygonSale(): Promise<KannaPreSale> {
    return Promise.resolve(KannaProvider.polygonSaleInstanceAsManager);
  }

  async token(): Promise<ERC20> {
    return Promise.resolve(KannaProvider.ethereumTokenInstanceAsManager);
  }

  async tokenPolygon(): Promise<ERC20> {
    return Promise.resolve(KannaProvider.polygonTokenInstanceAsManager);
  }

  async auditPool(): Promise<KannaAuditStakePool> {
    return Promise.resolve(KannaProvider.ethereumAuditPoolInstanceAsManager);
  }

  async polygonAuditPool(): Promise<KannaAuditStakePool> {
    return Promise.resolve(KannaProvider.polygonAuditPoolInstanceAsManager);
  }
}
