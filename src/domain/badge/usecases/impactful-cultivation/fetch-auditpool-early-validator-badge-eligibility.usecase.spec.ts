import { ethers } from 'ethers';
import { Settings } from '../../../common/settings';
import { FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { FetchableAuditPoolRemoteEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-remote-event.port';
import { FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';
import { FetchAuditPoolBadgeEligibilityUseCase } from './fetch-auditpool-badge-eligibility.usecase';
import { AuditPoolRemoteEventDto } from '../../../upstream-domains/impactful-cultivation/dtos/audit-pool-remote-event.dto';

describe('FetchAuditPoolEarlyValidatorBadgeEligibilityUseCase', () => {
  let fetchableAuditPoolEventPort: FetchableAuditPoolRemoteEventPort;
  let fetchableAuditPoolStakesPort: FetchableAuditPoolStakesPort;
  let fetchableBadgeEventPort: FetchableBadgeEventPort;
  const settings = {
    badge: {
      impactfulCultivation: {
        auditPool: {
          referenceMetadataId: 3,
        },
      },
    },
  } as Settings;

  beforeEach(() => {
    jest.resetAllMocks();

    fetchableAuditPoolEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };

    fetchableAuditPoolStakesPort = {
      fetchStakeOf: jest.fn().mockResolvedValue(false),
    };

    fetchableBadgeEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };
  });

  it('throws error when cryptoWallet is invalid', async () => {
    const cryptoWallet = 'invalid-wallet';

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    await expect(
      fetchAuditPoolBadgeEligibilityUseCase.execute(cryptoWallet),
    ).rejects.toThrowError('invalid wallet address');
  });

  it('returns undefined when cryptoWallet is not staked', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when cryptoWallet is staked after audit pool initialization', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableAuditPoolEventPort.fetch = jest
      .fn()
      .mockResolvedValueOnce([
        {
          blockTimestamp: 100,
        } as AuditPoolRemoteEventDto,
      ])
      .mockResolvedValueOnce([
        {
          blockTimestamp: 200,
        } as AuditPoolRemoteEventDto,
      ]);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when cryptoWallet has already minted', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableBadgeEventPort.fetch = jest.fn().mockResolvedValue([
      {
        type: 3,
        referenceMetadataId: 3,
        cryptoWallet,
        timestamp: 0,
      },
    ]);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('should return badge eligibility when audit pool is initialized and cryptoWallet is staked before initialization', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableAuditPoolEventPort.fetch = jest
      .fn()
      .mockResolvedValueOnce([
        {
          blockTimestamp: 100,
        } as AuditPoolRemoteEventDto,
      ])
      .mockResolvedValueOnce([]);

    fetchableAuditPoolStakesPort.fetchStakeOf = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toEqual({
      amount: 1,
      referenceMetadataId: 3,
    });
  });
});
