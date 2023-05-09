import { NetworkType } from '../../common/enums/network-type.enum';
import { unsafeMul } from '../../common/util';
import { Purchase, PurchaseProps } from '../entities/purchase.entity';

const ETH_PRECISION = 1e18;
const USD_PRECISION = 1e8;

export class PurchaseBuilder {
  private props: PurchaseProps;
  private id?: number;

  private contractAddress: string;
  private network: string;
  private cryptoWallet: string;
  private purchaseTransactionHash: string;
  private knnPriceInUsd: number;
  private paymentDate: Date;
  private totalKnn: number;
  private gasUsed: number;
  private cumulativeGasUsed: number;
  private effectiveGasPrice: number;
  private blockNumber: number;

  constructor(
    from: string,
    to: string,
    chainId: number,
    transactionHash: string,
    knnPriceInUsd: number,
    amountInKNN: number,
    gasUsed: number,
    cumulativeGasUsed: number,
    effectiveGasPrice: number,
    blockNumber: number,
  ) {
    this.contractAddress = to;
    this.network = NetworkType[chainId];
    this.cryptoWallet = from;
    this.purchaseTransactionHash = transactionHash;
    this.knnPriceInUsd = knnPriceInUsd;
    this.totalKnn = this.toETHPrecision(amountInKNN);

    this.gasUsed = gasUsed;
    this.cumulativeGasUsed = cumulativeGasUsed;
    this.effectiveGasPrice = effectiveGasPrice;
    this.blockNumber = blockNumber;
  }

  private getBaseProps() {
    return {
      contractAddress: this.contractAddress,
      network: this.network,
      cryptoWallet: this.cryptoWallet,
      purchaseTransactionHash: this.purchaseTransactionHash,
      knnPriceInUsd: this.toUSDPrecision(this.knnPriceInUsd),
      totalKnn: this.totalKnn,
      paymentDate: this.paymentDate,
    };
  }

  private toETHPrecision(value: number): number {
    return value / ETH_PRECISION;
  }

  private toUSDPrecision(value: number): number {
    return value / USD_PRECISION;
  }

  public eth(
    ethPriceInUsd: number,
    totalEth: number,
    pastDue: Date,
  ): PurchaseBuilder {
    this.paymentDate = pastDue;

    const totalGasEth = unsafeMul(
      this.gasUsed,
      this.toETHPrecision(this.effectiveGasPrice),
    );

    const totalGasUsd = unsafeMul(
      totalGasEth,
      this.toUSDPrecision(ethPriceInUsd),
    );

    const totalUsd = unsafeMul(totalEth, this.toUSDPrecision(ethPriceInUsd));

    const props = {
      ...this.getBaseProps(),
      totalEth: this.toETHPrecision(totalEth),
      totalGasEth,

      ethPriceInUsd: this.toUSDPrecision(ethPriceInUsd),

      totalUsd: this.toETHPrecision(totalUsd),
      totalGasUsd,

      ethereumBlockNumber: this.blockNumber,
    };

    this.props = props;
    return this;
  }

  public matic(
    maticPriceInUsd: number,
    totalMatic: number,
    pastDue: Date,
  ): PurchaseBuilder {
    this.paymentDate = pastDue;

    const totalGasMatic = unsafeMul(
      this.gasUsed,
      this.toETHPrecision(this.effectiveGasPrice),
    );

    const totalGasUsd = unsafeMul(
      totalGasMatic,
      this.toUSDPrecision(maticPriceInUsd),
    );

    const totalUsd = unsafeMul(
      totalMatic,
      this.toUSDPrecision(maticPriceInUsd),
    );

    const props = {
      ...this.getBaseProps(),
      totalMatic: this.toETHPrecision(totalMatic),
      totalGasMatic,

      maticPriceInUsd: this.toUSDPrecision(maticPriceInUsd),

      totalUsd: this.toETHPrecision(totalUsd),
      totalGasUsd,

      polygonBlockNumber: this.blockNumber,
    };

    this.props = props;
    return this;
  }

  public build(): Purchase {
    return new Purchase(this.props, this.id);
  }
}
