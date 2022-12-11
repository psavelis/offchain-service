/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from 'ethers';
import { BytesLike } from '@ethersproject/bytes';
import { Listener, Provider } from '@ethersproject/providers';
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';
import type { TypedEventFilter, TypedEvent, TypedListener } from './common';

interface KannaYieldInterface extends ethers.utils.Interface {
  functions: {
    'FEE_BASIS_POINT()': FunctionFragment;
    'addReward(uint256,uint256)': FunctionFragment;
    'balanceOf(address)': FunctionFragment;
    'calculateReward(address)': FunctionFragment;
    'collectFees()': FunctionFragment;
    'earned(address)': FunctionFragment;
    'endDate()': FunctionFragment;
    'exit()': FunctionFragment;
    'feeRecipient()': FunctionFragment;
    'fees(uint256)': FunctionFragment;
    'holderRewardPerTokenPaid(address)': FunctionFragment;
    'knnToken()': FunctionFragment;
    'knnYieldPool()': FunctionFragment;
    'knnYieldTotalFee()': FunctionFragment;
    'lastPaymentEvent()': FunctionFragment;
    'lastUpdateTime()': FunctionFragment;
    'owner()': FunctionFragment;
    'poolStartDate()': FunctionFragment;
    'rawBalances(address)': FunctionFragment;
    'reducedFee()': FunctionFragment;
    'renounceOwnership()': FunctionFragment;
    'rewardPerToken()': FunctionFragment;
    'rewardPerTokenStored()': FunctionFragment;
    'rewardRate()': FunctionFragment;
    'started(address)': FunctionFragment;
    'subscribe(uint256)': FunctionFragment;
    'subscriptionFee()': FunctionFragment;
    'tier(uint256)': FunctionFragment;
    'transferOwnership(address)': FunctionFragment;
    'withdraw(uint256)': FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: 'FEE_BASIS_POINT',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'addReward',
    values: [BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'balanceOf', values: [string]): string;
  encodeFunctionData(
    functionFragment: 'calculateReward',
    values: [string],
  ): string;
  encodeFunctionData(
    functionFragment: 'collectFees',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'earned', values: [string]): string;
  encodeFunctionData(functionFragment: 'endDate', values?: undefined): string;
  encodeFunctionData(functionFragment: 'exit', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'feeRecipient',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'fees', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'holderRewardPerTokenPaid',
    values: [string],
  ): string;
  encodeFunctionData(functionFragment: 'knnToken', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'knnYieldPool',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'knnYieldTotalFee',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'lastPaymentEvent',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'lastUpdateTime',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'poolStartDate',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'rawBalances', values: [string]): string;
  encodeFunctionData(
    functionFragment: 'reducedFee',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'renounceOwnership',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'rewardPerToken',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'rewardPerTokenStored',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'rewardRate',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'started', values: [string]): string;
  encodeFunctionData(
    functionFragment: 'subscribe',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'subscriptionFee',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'tier', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'transferOwnership',
    values: [string],
  ): string;
  encodeFunctionData(
    functionFragment: 'withdraw',
    values: [BigNumberish],
  ): string;

  decodeFunctionResult(
    functionFragment: 'FEE_BASIS_POINT',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'addReward', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'balanceOf', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'calculateReward',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'collectFees',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'earned', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'endDate', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'exit', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'feeRecipient',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'fees', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'holderRewardPerTokenPaid',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'knnToken', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'knnYieldPool',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'knnYieldTotalFee',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'lastPaymentEvent',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'lastUpdateTime',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'poolStartDate',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'rawBalances',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'reducedFee', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'renounceOwnership',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'rewardPerToken',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'rewardPerTokenStored',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'rewardRate', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'started', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'subscribe', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'subscriptionFee',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'tier', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'transferOwnership',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'withdraw', data: BytesLike): Result;

  events: {
    'Collect(address,address,uint256)': EventFragment;
    'Fee(address,uint256,uint256,uint256)': EventFragment;
    'OwnershipTransferred(address,address)': EventFragment;
    'Reward(address,uint256)': EventFragment;
    'RewardAdded(address,uint256)': EventFragment;
    'Subscription(address,uint256,uint256,uint256)': EventFragment;
    'Withdraw(address,uint256)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'Collect'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Fee'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'OwnershipTransferred'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Reward'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'RewardAdded'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Subscription'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Withdraw'): EventFragment;
}

export type CollectEvent = TypedEvent<
  [string, string, BigNumber] & {
    user: string;
    returnAccount: string;
    fee: BigNumber;
  }
>;

export type FeeEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber] & {
    user: string;
    amount: BigNumber;
    fee: BigNumber;
    finalAmount: BigNumber;
  }
>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string] & { previousOwner: string; newOwner: string }
>;

export type RewardEvent = TypedEvent<
  [string, BigNumber] & { user: string; reward: BigNumber }
>;

export type RewardAddedEvent = TypedEvent<
  [string, BigNumber] & { user: string; reward: BigNumber }
>;

export type SubscriptionEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber] & {
    user: string;
    subscriptionAmount: BigNumber;
    fee: BigNumber;
    finalAmount: BigNumber;
  }
>;

export type WithdrawEvent = TypedEvent<
  [string, BigNumber] & { user: string; amount: BigNumber }
>;

export class KannaYield extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: KannaYieldInterface;

  functions: {
    FEE_BASIS_POINT(overrides?: CallOverrides): Promise<[BigNumber]>;

    addReward(
      reward: BigNumberish,
      rewardsDuration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    balanceOf(holder: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    calculateReward(
      holder: string,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    collectFees(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    earned(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    endDate(overrides?: CallOverrides): Promise<[BigNumber]>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    feeRecipient(overrides?: CallOverrides): Promise<[string]>;

    fees(arg0: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;

    holderRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    knnToken(overrides?: CallOverrides): Promise<[string]>;

    knnYieldPool(overrides?: CallOverrides): Promise<[BigNumber]>;

    knnYieldTotalFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    lastPaymentEvent(overrides?: CallOverrides): Promise<[BigNumber]>;

    lastUpdateTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    poolStartDate(overrides?: CallOverrides): Promise<[BigNumber]>;

    rawBalances(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    reducedFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    rewardPerToken(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    started(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    subscribe(
      subscriptionAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    subscriptionFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    tier(arg0: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;
  };

  FEE_BASIS_POINT(overrides?: CallOverrides): Promise<BigNumber>;

  addReward(
    reward: BigNumberish,
    rewardsDuration: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

  calculateReward(
    holder: string,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  collectFees(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  earned(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  endDate(overrides?: CallOverrides): Promise<BigNumber>;

  exit(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  feeRecipient(overrides?: CallOverrides): Promise<string>;

  fees(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  holderRewardPerTokenPaid(
    arg0: string,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  knnToken(overrides?: CallOverrides): Promise<string>;

  knnYieldPool(overrides?: CallOverrides): Promise<BigNumber>;

  knnYieldTotalFee(overrides?: CallOverrides): Promise<BigNumber>;

  lastPaymentEvent(overrides?: CallOverrides): Promise<BigNumber>;

  lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  poolStartDate(overrides?: CallOverrides): Promise<BigNumber>;

  rawBalances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  reducedFee(overrides?: CallOverrides): Promise<BigNumber>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

  rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

  rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

  started(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  subscribe(
    subscriptionAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  subscriptionFee(overrides?: CallOverrides): Promise<BigNumber>;

  tier(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  withdraw(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    FEE_BASIS_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    addReward(
      reward: BigNumberish,
      rewardsDuration: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

    calculateReward(
      holder: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    collectFees(overrides?: CallOverrides): Promise<BigNumber>;

    earned(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    exit(overrides?: CallOverrides): Promise<void>;

    feeRecipient(overrides?: CallOverrides): Promise<string>;

    fees(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    holderRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    knnToken(overrides?: CallOverrides): Promise<string>;

    knnYieldPool(overrides?: CallOverrides): Promise<BigNumber>;

    knnYieldTotalFee(overrides?: CallOverrides): Promise<BigNumber>;

    lastPaymentEvent(overrides?: CallOverrides): Promise<BigNumber>;

    lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    poolStartDate(overrides?: CallOverrides): Promise<BigNumber>;

    rawBalances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    reducedFee(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

    rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

    started(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    subscribe(
      subscriptionAmount: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    subscriptionFee(overrides?: CallOverrides): Promise<BigNumber>;

    tier(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    withdraw(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    'Collect(address,address,uint256)'(
      user?: string | null,
      returnAccount?: string | null,
      fee?: null,
    ): TypedEventFilter<
      [string, string, BigNumber],
      { user: string; returnAccount: string; fee: BigNumber }
    >;

    Collect(
      user?: string | null,
      returnAccount?: string | null,
      fee?: null,
    ): TypedEventFilter<
      [string, string, BigNumber],
      { user: string; returnAccount: string; fee: BigNumber }
    >;

    'Fee(address,uint256,uint256,uint256)'(
      user?: string | null,
      amount?: null,
      fee?: null,
      finalAmount?: null,
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        amount: BigNumber;
        fee: BigNumber;
        finalAmount: BigNumber;
      }
    >;

    Fee(
      user?: string | null,
      amount?: null,
      fee?: null,
      finalAmount?: null,
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        amount: BigNumber;
        fee: BigNumber;
        finalAmount: BigNumber;
      }
    >;

    'OwnershipTransferred(address,address)'(
      previousOwner?: string | null,
      newOwner?: string | null,
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;

    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null,
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;

    'Reward(address,uint256)'(
      user?: string | null,
      reward?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; reward: BigNumber }
    >;

    Reward(
      user?: string | null,
      reward?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; reward: BigNumber }
    >;

    'RewardAdded(address,uint256)'(
      user?: string | null,
      reward?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; reward: BigNumber }
    >;

    RewardAdded(
      user?: string | null,
      reward?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; reward: BigNumber }
    >;

    'Subscription(address,uint256,uint256,uint256)'(
      user?: string | null,
      subscriptionAmount?: null,
      fee?: null,
      finalAmount?: null,
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        subscriptionAmount: BigNumber;
        fee: BigNumber;
        finalAmount: BigNumber;
      }
    >;

    Subscription(
      user?: string | null,
      subscriptionAmount?: null,
      fee?: null,
      finalAmount?: null,
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        subscriptionAmount: BigNumber;
        fee: BigNumber;
        finalAmount: BigNumber;
      }
    >;

    'Withdraw(address,uint256)'(
      user?: string | null,
      amount?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;

    Withdraw(
      user?: string | null,
      amount?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    FEE_BASIS_POINT(overrides?: CallOverrides): Promise<BigNumber>;

    addReward(
      reward: BigNumberish,
      rewardsDuration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    balanceOf(holder: string, overrides?: CallOverrides): Promise<BigNumber>;

    calculateReward(
      holder: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    collectFees(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    earned(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    feeRecipient(overrides?: CallOverrides): Promise<BigNumber>;

    fees(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    holderRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    knnToken(overrides?: CallOverrides): Promise<BigNumber>;

    knnYieldPool(overrides?: CallOverrides): Promise<BigNumber>;

    knnYieldTotalFee(overrides?: CallOverrides): Promise<BigNumber>;

    lastPaymentEvent(overrides?: CallOverrides): Promise<BigNumber>;

    lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    poolStartDate(overrides?: CallOverrides): Promise<BigNumber>;

    rawBalances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    reducedFee(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

    rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

    started(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    subscribe(
      subscriptionAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    subscriptionFee(overrides?: CallOverrides): Promise<BigNumber>;

    tier(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    FEE_BASIS_POINT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    addReward(
      reward: BigNumberish,
      rewardsDuration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    balanceOf(
      holder: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    calculateReward(
      holder: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    collectFees(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    earned(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    endDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    feeRecipient(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fees(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    holderRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    knnToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    knnYieldPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    knnYieldTotalFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lastPaymentEvent(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lastUpdateTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolStartDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rawBalances(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    reducedFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    rewardPerToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rewardPerTokenStored(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    rewardRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    started(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    subscribe(
      subscriptionAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    subscriptionFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tier(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;
  };
}
