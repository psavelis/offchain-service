/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface KannaPreSaleInterface extends utils.Interface {
  functions: {
    "CLAIM_MANAGER_ROLE()": FunctionFragment;
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "KNN_DECIMALS()": FunctionFragment;
    "USD_AGGREGATOR_DECIMALS()": FunctionFragment;
    "addClaimManager(address)": FunctionFragment;
    "availableSupply()": FunctionFragment;
    "buyTokens()": FunctionFragment;
    "claim(address,uint256,uint256)": FunctionFragment;
    "claimLocked(address,uint256,uint256)": FunctionFragment;
    "convertToKNN(uint256)": FunctionFragment;
    "convertToWEI(uint256)": FunctionFragment;
    "end(address)": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "knnLocked()": FunctionFragment;
    "knnPriceInUSD()": FunctionFragment;
    "knnToken()": FunctionFragment;
    "lockSupply(uint256,uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "priceAggregator()": FunctionFragment;
    "removeClaimManager(address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unlockSupply(uint256,uint256)": FunctionFragment;
    "withdraw(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "CLAIM_MANAGER_ROLE"
      | "DEFAULT_ADMIN_ROLE"
      | "KNN_DECIMALS"
      | "USD_AGGREGATOR_DECIMALS"
      | "addClaimManager"
      | "availableSupply"
      | "buyTokens"
      | "claim"
      | "claimLocked"
      | "convertToKNN"
      | "convertToWEI"
      | "end"
      | "getRoleAdmin"
      | "grantRole"
      | "hasRole"
      | "knnLocked"
      | "knnPriceInUSD"
      | "knnToken"
      | "lockSupply"
      | "owner"
      | "priceAggregator"
      | "removeClaimManager"
      | "renounceOwnership"
      | "renounceRole"
      | "revokeRole"
      | "supportsInterface"
      | "transferOwnership"
      | "unlockSupply"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "CLAIM_MANAGER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "KNN_DECIMALS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "USD_AGGREGATOR_DECIMALS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addClaimManager",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "availableSupply",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "buyTokens", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "claim",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "claimLocked",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "convertToKNN",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "convertToWEI",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "end",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "knnLocked", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "knnPriceInUSD",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "knnToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "lockSupply",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "priceAggregator",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeClaimManager",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "unlockSupply",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "CLAIM_MANAGER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "KNN_DECIMALS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "USD_AGGREGATOR_DECIMALS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addClaimManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "availableSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "buyTokens", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimLocked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "convertToKNN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "convertToWEI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "end", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "knnLocked", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "knnPriceInUSD",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "knnToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lockSupply", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "priceAggregator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeClaimManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unlockSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "Claim(address,uint256,uint256)": EventFragment;
    "Lock(uint256,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Purchase(address,uint256,uint256,uint256,uint256)": EventFragment;
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "Unlock(uint256,uint256)": EventFragment;
    "Withdraw(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Claim"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Lock"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Purchase"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unlock"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface ClaimEventObject {
  holder: string;
  ref: BigNumber;
  amountInKNN: BigNumber;
}
export type ClaimEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  ClaimEventObject
>;

export type ClaimEventFilter = TypedEventFilter<ClaimEvent>;

export interface LockEventObject {
  ref: BigNumber;
  amountInKNN: BigNumber;
}
export type LockEvent = TypedEvent<[BigNumber, BigNumber], LockEventObject>;

export type LockEventFilter = TypedEventFilter<LockEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface PurchaseEventObject {
  holder: string;
  amountInWEI: BigNumber;
  knnPriceInUSD: BigNumber;
  ethPriceInUSD: BigNumber;
  amountInKNN: BigNumber;
}
export type PurchaseEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber, BigNumber],
  PurchaseEventObject
>;

export type PurchaseEventFilter = TypedEventFilter<PurchaseEvent>;

export interface RoleAdminChangedEventObject {
  role: string;
  previousAdminRole: string;
  newAdminRole: string;
}
export type RoleAdminChangedEvent = TypedEvent<
  [string, string, string],
  RoleAdminChangedEventObject
>;

export type RoleAdminChangedEventFilter =
  TypedEventFilter<RoleAdminChangedEvent>;

export interface RoleGrantedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleGrantedEvent = TypedEvent<
  [string, string, string],
  RoleGrantedEventObject
>;

export type RoleGrantedEventFilter = TypedEventFilter<RoleGrantedEvent>;

export interface RoleRevokedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleRevokedEvent = TypedEvent<
  [string, string, string],
  RoleRevokedEventObject
>;

export type RoleRevokedEventFilter = TypedEventFilter<RoleRevokedEvent>;

export interface UnlockEventObject {
  ref: BigNumber;
  amountInKNN: BigNumber;
}
export type UnlockEvent = TypedEvent<[BigNumber, BigNumber], UnlockEventObject>;

export type UnlockEventFilter = TypedEventFilter<UnlockEvent>;

export interface WithdrawEventObject {
  recipient: string;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface KannaPreSale extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: KannaPreSaleInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    CLAIM_MANAGER_ROLE(overrides?: CallOverrides): Promise<[string]>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    KNN_DECIMALS(overrides?: CallOverrides): Promise<[BigNumber]>;

    USD_AGGREGATOR_DECIMALS(overrides?: CallOverrides): Promise<[BigNumber]>;

    addClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    availableSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    buyTokens(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claim(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimLocked(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    convertToKNN(
      amountInWEI: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    convertToWEI(
      amountInKNN: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    end(
      leftoverRecipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    knnLocked(overrides?: CallOverrides): Promise<[BigNumber]>;

    knnPriceInUSD(overrides?: CallOverrides): Promise<[BigNumber]>;

    knnToken(overrides?: CallOverrides): Promise<[string]>;

    lockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    priceAggregator(overrides?: CallOverrides): Promise<[string]>;

    removeClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unlockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  CLAIM_MANAGER_ROLE(overrides?: CallOverrides): Promise<string>;

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  KNN_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

  USD_AGGREGATOR_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

  addClaimManager(
    claimManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  availableSupply(overrides?: CallOverrides): Promise<BigNumber>;

  buyTokens(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claim(
    recipient: PromiseOrValue<string>,
    amountInKNN: PromiseOrValue<BigNumberish>,
    ref: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimLocked(
    recipient: PromiseOrValue<string>,
    amountInKNN: PromiseOrValue<BigNumberish>,
    ref: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  convertToKNN(
    amountInWEI: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber]>;

  convertToWEI(
    amountInKNN: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber]>;

  end(
    leftoverRecipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(
    role: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  grantRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  hasRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  knnLocked(overrides?: CallOverrides): Promise<BigNumber>;

  knnPriceInUSD(overrides?: CallOverrides): Promise<BigNumber>;

  knnToken(overrides?: CallOverrides): Promise<string>;

  lockSupply(
    amountInKNN: PromiseOrValue<BigNumberish>,
    ref: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  priceAggregator(overrides?: CallOverrides): Promise<string>;

  removeClaimManager(
    claimManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  renounceRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unlockSupply(
    amountInKNN: PromiseOrValue<BigNumberish>,
    ref: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    CLAIM_MANAGER_ROLE(overrides?: CallOverrides): Promise<string>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    KNN_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    USD_AGGREGATOR_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    addClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    availableSupply(overrides?: CallOverrides): Promise<BigNumber>;

    buyTokens(overrides?: CallOverrides): Promise<void>;

    claim(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    claimLocked(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    convertToKNN(
      amountInWEI: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    convertToWEI(
      amountInKNN: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    end(
      leftoverRecipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    knnLocked(overrides?: CallOverrides): Promise<BigNumber>;

    knnPriceInUSD(overrides?: CallOverrides): Promise<BigNumber>;

    knnToken(overrides?: CallOverrides): Promise<string>;

    lockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    priceAggregator(overrides?: CallOverrides): Promise<string>;

    removeClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    unlockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Claim(address,uint256,uint256)"(
      holder?: PromiseOrValue<string> | null,
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): ClaimEventFilter;
    Claim(
      holder?: PromiseOrValue<string> | null,
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): ClaimEventFilter;

    "Lock(uint256,uint256)"(
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): LockEventFilter;
    Lock(
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): LockEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "Purchase(address,uint256,uint256,uint256,uint256)"(
      holder?: PromiseOrValue<string> | null,
      amountInWEI?: null,
      knnPriceInUSD?: null,
      ethPriceInUSD?: null,
      amountInKNN?: PromiseOrValue<BigNumberish> | null
    ): PurchaseEventFilter;
    Purchase(
      holder?: PromiseOrValue<string> | null,
      amountInWEI?: null,
      knnPriceInUSD?: null,
      ethPriceInUSD?: null,
      amountInKNN?: PromiseOrValue<BigNumberish> | null
    ): PurchaseEventFilter;

    "RoleAdminChanged(bytes32,bytes32,bytes32)"(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;
    RoleAdminChanged(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;

    "RoleGranted(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;
    RoleGranted(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;

    "RoleRevoked(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;
    RoleRevoked(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;

    "Unlock(uint256,uint256)"(
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): UnlockEventFilter;
    Unlock(
      ref?: PromiseOrValue<BigNumberish> | null,
      amountInKNN?: null
    ): UnlockEventFilter;

    "Withdraw(address,uint256)"(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): WithdrawEventFilter;
  };

  estimateGas: {
    CLAIM_MANAGER_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    KNN_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    USD_AGGREGATOR_DECIMALS(overrides?: CallOverrides): Promise<BigNumber>;

    addClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    availableSupply(overrides?: CallOverrides): Promise<BigNumber>;

    buyTokens(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claim(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimLocked(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    convertToKNN(
      amountInWEI: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    convertToWEI(
      amountInKNN: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    end(
      leftoverRecipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    knnLocked(overrides?: CallOverrides): Promise<BigNumber>;

    knnPriceInUSD(overrides?: CallOverrides): Promise<BigNumber>;

    knnToken(overrides?: CallOverrides): Promise<BigNumber>;

    lockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    priceAggregator(overrides?: CallOverrides): Promise<BigNumber>;

    removeClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unlockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdraw(
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    CLAIM_MANAGER_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    KNN_DECIMALS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    USD_AGGREGATOR_DECIMALS(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    addClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    availableSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    buyTokens(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claim(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimLocked(
      recipient: PromiseOrValue<string>,
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    convertToKNN(
      amountInWEI: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    convertToWEI(
      amountInKNN: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    end(
      leftoverRecipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    knnLocked(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    knnPriceInUSD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    knnToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    priceAggregator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeClaimManager(
      claimManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unlockSupply(
      amountInKNN: PromiseOrValue<BigNumberish>,
      ref: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
