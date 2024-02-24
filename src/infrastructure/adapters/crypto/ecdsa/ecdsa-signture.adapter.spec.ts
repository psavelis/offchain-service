import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { Chain } from '../../../../domain/common/entities/chain.entity';
import { NetworkType } from '../../../../domain/common/enums/network-type.enum';
import { SignerType } from '../../../../domain/common/enums/signer-type.enum';
import { AuthChallenge } from '../../../../domain/upstream-domains/identity/authentication/entities/auth-challenge.entity';
import { ECDSASignatureAdapter } from './ecdsa-signature.adapter';

const settingsMock = {
  blockchain: {
    ethereum: {
      legacyPreSaleClaimSignerKey: ethers.Wallet.createRandom().privateKey,
      fixedSaleClaimsSignerKey: ethers.Wallet.createRandom().privateKey,
      badgesMinterSignerKey: ethers.Wallet.createRandom().privateKey,
      dynamicSaleClaimsSignerKey: ethers.Wallet.createRandom().privateKey,
    },
    polygon: {
      claimSignerKey: ethers.Wallet.createRandom().privateKey,
      badgesMinterSignerKey: ethers.Wallet.createRandom().privateKey,
      dynamicSaleClaimsSignerKey: ethers.Wallet.createRandom().privateKey,
    },
  },
};

describe('ECDSASignatureAdapter', () => {
  const defaultAllowDebugProd = process.env.ALLOW_DEBUG_PROD;
  beforeAll(() => {
    process.env.ALLOW_DEBUG_PROD = 'true';
  });

  afterAll(() => {
    process.env.ALLOW_DEBUG_PROD = defaultAllowDebugProd;
  });

  it('should return a signature on L1 (Ethereum) for a given payload', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    const result = await signatureAdapter.sign(
      {
        types: ['address', 'uint256', 'uint256'],
        values: [ethers.Wallet.createRandom().address, '1', '1'],
      },
      SignerType.SaleClaimManager,
      new Chain(NetworkType.EthereumSepolia),
    );

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('cryptoWallet');
  });

  it('should return a signature on L2 (Polygon) for a given payload', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    const result = await signatureAdapter.sign(
      {
        types: ['address', 'uint256', 'uint256'],
        values: [ethers.Wallet.createRandom().address, '1', '1'],
      },
      SignerType.SaleClaimManager,
      new Chain(NetworkType.PolygonMumbai),
    );

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('cryptoWallet');
  });

  it('should throw an error if the signer is not found', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    await expect(
      signatureAdapter.sign(
        {
          types: ['address', 'uint256', 'uint256'],
          values: [ethers.Wallet.createRandom().address, '1', '1'],
        },
        'invalid' as any,
        new Chain(NetworkType.PolygonMumbai),
      ),
    ).rejects.toThrowError();
  });

  it('should throw an error if the signer is not found on L1', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    await expect(
      signatureAdapter.sign(
        {
          types: ['address', 'uint256', 'uint256'],
          values: [ethers.Wallet.createRandom().address, '1', '1'],
        },
        0x999 as SignerType,
        new Chain(NetworkType.Ethereum),
      ),
    ).rejects.toThrowError();
  });

  it('should throw an error if the signer is not found on L2', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    await expect(
      signatureAdapter.sign(
        {
          types: ['address', 'uint256', 'uint256'],
          values: [ethers.Wallet.createRandom().address, '1', '1'],
        },
        0x999 as SignerType,
        new Chain(NetworkType.Polygon),
      ),
    ).rejects.toThrowError();
  });

  describe('EIP-4361 (Sign-In With Ethereum)', () => {
    it('should verify siwe message', async () => {
      const wallet = ethers.Wallet.createRandom();
      const randomuint256 = ethers.utils
        .hexlify(ethers.utils.randomBytes(32))
        .slice(2, 16)
        .toUpperCase();

      const chain = new Chain(NetworkType.Ethereum);
      const signatureData = AuthChallenge.getSignatureData(
        wallet.address,
        randomuint256,
        chain,
        'https://dapp.kannacoin.io/login',
      );

      const messageData = AuthChallenge.getSignatureData(
        wallet.address,
        randomuint256,
        chain,
        signatureData.uri,
      );

      const siweMessage = new SiweMessage(messageData);
      const message = siweMessage.prepareMessage();

      const signature = await wallet.signMessage(message);

      const signatureAdapter = ECDSASignatureAdapter.getInstance(
        settingsMock as any,
      );

      const isVerified = await signatureAdapter.verify(
        signatureData.address,
        signatureData,
        signature,
      );

      expect(isVerified).toBe(true);
    });
  });
});
