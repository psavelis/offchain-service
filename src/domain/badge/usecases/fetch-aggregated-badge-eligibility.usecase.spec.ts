import { ethers } from 'ethers';
import { FetchAggregatedBadgeEligibilityUseCase } from './fetch-aggregated-badge-eligibility.usecase';
import { FetchAuditPoolBadgeEligibilityUseCase } from './impactful-cultivation/fetch-auditpool-badge-eligibility.usecase';
import { FetchPreSaleBadgeEligibilityUseCase } from './presale/fetch-presale-badge-eligibility.usecase';
import { FetchBadgeEligibilityResponseDto } from '../dtos/fetch-badge-eligibility-response.dto';
import { FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase } from './impactful-cultivation/fetch-auditpool-early-validator-badge-eligibility.usecase';

describe('FetchAggregatedBadgeEligibilityUseCase', () => {
  let fetchAuditPoolBadgeEligibilityUseCase: FetchAuditPoolBadgeEligibilityUseCase;
  let fetchPreSaleBadgeEligibilityUseCase: FetchPreSaleBadgeEligibilityUseCase;
  let fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase: FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase;
  const settingsMock = {
    badge: {
      impactfulCultivation: {
        auditPool: {
          referenceMetadataId: 4,
        },
        auditPoolEarlyValidator: {
          referenceMetadataId: 3,
        },
      },
      presale: {
        referenceMetadataId: 2,
      },
    },
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();

    fetchAuditPoolBadgeEligibilityUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any;

    fetchPreSaleBadgeEligibilityUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any;

    fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  it('returns empty array when no eligibility', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    const fetchAggregatedBadgeEligibilityUseCase =
      new FetchAggregatedBadgeEligibilityUseCase(
        settingsMock,
        fetchAuditPoolBadgeEligibilityUseCase,
        fetchPreSaleBadgeEligibilityUseCase,
        fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
      );

    const result = await fetchAggregatedBadgeEligibilityUseCase.executeAll(
      cryptoWallet,
    );

    expect(result).toEqual([]);
  });

  it('returns eligibility when audit pool eligibility', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;
    const auditPoolEligibility = {
      cryptoWallet,
      referenceMetadataId: 3,
    } as FetchBadgeEligibilityResponseDto;

    fetchAuditPoolBadgeEligibilityUseCase = {
      execute: jest.fn().mockResolvedValue(auditPoolEligibility),
    } as any;

    const fetchAggregatedBadgeEligibilityUseCase =
      new FetchAggregatedBadgeEligibilityUseCase(
        settingsMock,
        fetchAuditPoolBadgeEligibilityUseCase,
        fetchPreSaleBadgeEligibilityUseCase,
        fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
      );

    const result = await fetchAggregatedBadgeEligibilityUseCase.executeAll(
      cryptoWallet,
    );

    expect(result).toEqual([auditPoolEligibility]);
  });

  it('returns eligibility when presale eligibility', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;
    const presaleEligibility = {
      cryptoWallet,
      referenceMetadataId: 3,
    } as FetchBadgeEligibilityResponseDto;

    fetchPreSaleBadgeEligibilityUseCase = {
      execute: jest.fn().mockResolvedValue(presaleEligibility),
    } as any;

    const fetchAggregatedBadgeEligibilityUseCase =
      new FetchAggregatedBadgeEligibilityUseCase(
        settingsMock,
        fetchAuditPoolBadgeEligibilityUseCase,
        fetchPreSaleBadgeEligibilityUseCase,
        fetchAuditPoolEarlyValidatorBadgeEligibilityUseCase,
      );

    const result = await fetchAggregatedBadgeEligibilityUseCase.executeAll(
      cryptoWallet,
    );

    expect(result).toEqual([presaleEligibility]);
  });
});
