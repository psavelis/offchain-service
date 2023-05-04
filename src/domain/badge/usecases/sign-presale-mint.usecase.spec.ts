import { SignPreSaleMintUseCase } from './sign-presale-mint.usecase';

const settingsMock: any = {
  badge: {
    presale: {
      referenceMetadataId: 2,
    },
  },
};

describe('SignPreSaleMintUseCase', () => {
  it('should return a signed mint', async () => {
    const verifyMintInteractorMock = {
      execute: jest.fn().mockResolvedValue({
        isVerified: true,
        amount: 1,
      }),
    };

    const persistableMintHistoryPortMock = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const signaturePortMock = {
      hash: jest.fn().mockReturnValue('hash'),
      sign: jest.fn().mockResolvedValue({
        signature: 'signature',
        nonce: 'nonce',
      }),
    };

    const usecase = new SignPreSaleMintUseCase(
      settingsMock,
      verifyMintInteractorMock,
      persistableMintHistoryPortMock,
      signaturePortMock,
    );

    const result = await usecase.execute({
      cryptoWallet: '0x0',
      referenceMetadataId: settingsMock.badge.presale.referenceMetadataId,
      clientAgent: 'clientAgent',
      clientIp: 'clientIp',
    });

    expect(result).toEqual({
      cryptoWallet: '0x0',
      referenceMetadataId: 2,
      amount: 1,
      signature: 'signature',
      incremental: 1,
      nonce: 'nonce',
    });
  });
});
