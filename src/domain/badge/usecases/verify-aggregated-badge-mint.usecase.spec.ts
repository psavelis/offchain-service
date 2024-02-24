import { ethers } from 'ethers';
import { Chain } from '../../common/entities/chain.entity';
import { NetworkType } from '../../common/enums/network-type.enum';
import { VerifyAggregatedBadgeMintUseCase } from './verify-aggregated-badge-mint.usecase';

describe('VerifyAggregatedBadgeMintUseCase', () => {
  let randomWallet;
  const settingsMock: any = {
    badge: {
      impactfulCultivation: {
        auditPool: {
          referenceMetadataId: 2,
        },
      },
    },
  };

  beforeEach(() => {
    randomWallet = ethers.Wallet.createRandom();
  });

  it('should return true if the aggregated badge mint is valid', async () => {
    const fetchableMintHistoryPort = {
      fetchLast: jest.fn().mockResolvedValue(undefined),
    };

    const fetchAggregatedBadgeEligibilityUseCase = {
      executeSingle: jest.fn().mockResolvedValue({
        amount: 1,
      }),
    };

    const usecase = new VerifyAggregatedBadgeMintUseCase(
      settingsMock,
      fetchableMintHistoryPort,
      fetchAggregatedBadgeEligibilityUseCase as any,
    );

    const result = await usecase.execute({
      cryptoWallet: randomWallet.address,
      chain: new Chain(NetworkType.PolygonMumbai),
      referenceMetadataId:
        settingsMock.badge.impactfulCultivation.auditPool.referenceMetadataId,
    });

    expect(result.isVerified).toBeTruthy();
    expect(result.amount).toBe(1);
  });

  it('should return false if the aggregated badge mint is NOT valid', async () => {
    const fetchableMintHistoryPort = {
      fetchLast: jest.fn().mockResolvedValue(undefined),
    };

    const fetchAggregatedBadgeEligibilityUseCase = {
      executeSingle: jest.fn().mockResolvedValue(undefined),
    };

    const usecase = new VerifyAggregatedBadgeMintUseCase(
      settingsMock,
      fetchableMintHistoryPort,
      fetchAggregatedBadgeEligibilityUseCase as any,
    );

    const result = await usecase.execute({
      cryptoWallet: randomWallet.address,
      chain: new Chain(NetworkType.PolygonMumbai),
      referenceMetadataId:
        settingsMock.badge.impactfulCultivation.auditPool.referenceMetadataId,
    });

    expect(result.isVerified).toBeFalsy();
    expect(result.amount).toBe(0);
  });
});
