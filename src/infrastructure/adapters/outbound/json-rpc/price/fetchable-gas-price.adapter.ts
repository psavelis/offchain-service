import { FetchableGasPricePort } from '../../../../../domain/price/ports/fetchable-gas-price.port';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { Network, Alchemy, AlchemySettings } from 'alchemy-sdk';
import { Settings } from '../../../../../domain/common/settings';

export class FetchableGasPriceJsonRpcAdapter implements FetchableGasPricePort {
  static instance: FetchableGasPricePort;
  private readonly alchemyInstance: Alchemy;

  private constructor(readonly alchemySettings: AlchemySettings) {
    // const settings = {
    //   apiKey: "demo", // Replace with your Alchemy API Key.
    //   network: Network.ETH_MAINNET, // Replace with your network.
    // };

    this.alchemyInstance = new Alchemy(alchemySettings);
  }

  static getInstance(settings: Settings) {
    if (!FetchableGasPriceJsonRpcAdapter.instance) {
      FetchableGasPriceJsonRpcAdapter.instance =
        new FetchableGasPriceJsonRpcAdapter({
          network: settings.blockchain.network as Network,
          apiKey: settings.blockchain.providerApiKey,
        });
    }

    return FetchableGasPriceJsonRpcAdapter.instance;
  }

  async fetch(): Promise<CurrencyAmount> {
    // baseFee => web3alch.eth.getBlock('pending'): block.baseFeePerGas
    // maxPriority => web3alch.eth.getMaxPriorityFeePerGas: number 'tip' (maxPriority = tip)
    // ===>> maxFeePerGas: baseFee + maxPriority
    // ====> maxPriorityFeePerGas: maxPriority

    // https://docs.alchemy.com/reference/eth-gasprice
    const gasPrice = await this.alchemyInstance.core.getGasPrice();

    return {
      unassignedNumber: gasPrice.toString(),
      decimals: 18,
      isoCode: 'ETH',
    };
  }
}
