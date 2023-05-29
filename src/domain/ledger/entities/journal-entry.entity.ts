import { SequenceEntity } from '../../common/sequence-entity';
import { Settings } from '../../common/settings';
import { Props } from '../../common/entity';
import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { NetworkType } from '../../common/enums/network-type.enum';
import { LayerType } from '../../common/enums/layer-type.enum';
import { Chain } from '../../common/entities/chain.entity';

const nullAddress = '0x0000000000000000000000000000000000000000';

export type CryptoWallet = string;

export enum JournalMovementType {
  Debit = 'D',
  Credit = 'C',
}

export enum JournalEntryType {
  Join = 'JOIN',
  Exit = 'EXIT',
  Movement = 'MOVE',
}

export enum AccountGroup {
  Holder = 'HL',
  PreSale = 'PS',
  Sale = 'SL',
  Treasury = 'TS',
  Bridge = 'BG',
  Chain = 'CN',
  YieldPool = 'YP',
  CarbonPool = 'CP',
  StockOptionPool = 'SP',
  DecentralizedExchange = 'DX',
}

export interface JournalEntryProps extends Props {
  movementType: JournalMovementType;
  chainId: NetworkType;
  transactionHash: string;
  logIndex: number;
  entryType: JournalEntryType;
  account: CryptoWallet;
  accountGroup: AccountGroup;
  amount: number;
  uint256amount: string;
  entryDate: Date;
  isoCode: IsoCodeType;
  blockNumber: number;
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: number;
}

const routing = {
  ['0x0cC2CaeD31490B546c741BD93dbba8Ab387f7F2c']: AccountGroup.Bridge,
  ['0xd531Cf2142D9b9Dc8b077dF3c4E93B46E7Cf879a']: AccountGroup.Bridge,
  ['0x8397259c983751DAf40400790063935a11afa28a']: AccountGroup.Bridge,
  ['0xE633A3eeADF030Edf6ABB6Ebbf792679a475C042']: AccountGroup.Bridge,
  ['0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2']: AccountGroup.Bridge,
  ['0xB005512d330501d93b12Aa4A8FF30bE8858769dE']: AccountGroup.Bridge,
  ['0xd26CD6ce2a1705C49610F951f232510532c6856D']: AccountGroup.Bridge,
  ['0xeFfdCB49C2D0EF813764B709Ca3c6fe71f230E3e']: AccountGroup.Bridge,
};

export class JournalEntry extends SequenceEntity<JournalEntryProps> {
  private static AccountGroupingCache;
  private _chain: Chain;
  constructor(
    { blockchain: { ethereum, polygon } }: Settings,
    props: JournalEntryProps,
    id?: number,
  ) {
    super(props, id);

    if (!JournalEntry.AccountGroupingCache) {
      JournalEntry.AccountGroupingCache = {
        [LayerType.L1]: {
          [ethereum.contracts.legacyPreSaleAddress]: AccountGroup.Sale,
          [ethereum.contracts.saleAddress]: AccountGroup.Sale,
          [ethereum.contracts.gnosisSafeAddress]: AccountGroup.Treasury,
          ...routing,
          [nullAddress]: AccountGroup.Chain,
        },
        [LayerType.L2]: {
          [polygon.contracts.saleAddress]: AccountGroup.Sale,
          [polygon.contracts.gnosisSafeAddress]: AccountGroup.Treasury,
          ...routing,
          [nullAddress]: AccountGroup.Chain,
        },
      };
    }

    this._chain = new Chain(props.chainId);

    this.props.accountGroup =
      JournalEntry.AccountGroupingCache[this._chain.layer][props.account];

    if (!this.props.accountGroup) {
      this.props.accountGroup = AccountGroup.Holder;
    }
  }

  static compare(curr: JournalEntry, next: JournalEntry): 1 | 0 | -1 {
    if (curr.chainId === next.chainId && curr.blockNumber < next.blockNumber) {
      return -1;
    }

    if (curr.chainId === next.chainId && curr.blockNumber > next.blockNumber) {
      return 1;
    }

    if (
      curr.chainId === next.chainId &&
      curr.transactionHash === next.transactionHash &&
      curr.logIndex < next.logIndex
    ) {
      return -1;
    }

    if (
      curr.chainId === next.chainId &&
      curr.transactionHash === next.transactionHash &&
      curr.logIndex > next.logIndex
    ) {
      return 1;
    }

    if (curr.entryDate < next.entryDate) {
      return -1;
    }

    if (curr.entryDate > next.entryDate) {
      return 1;
    }

    return 0;
  }

  get id(): number {
    return this.getId();
  }

  get movementType(): JournalMovementType {
    return this.props.movementType;
  }

  get account(): CryptoWallet {
    return this.props.account;
  }

  get accountGroup(): AccountGroup {
    return this.props.accountGroup;
  }

  get amount(): number {
    return this.props.amount;
  }

  get uint256amount(): string {
    return this.props.uint256amount;
  }

  get entryDate(): Date {
    return this.props.entryDate;
  }

  get isoCode(): IsoCodeType {
    return this.props.isoCode;
  }

  get chainId(): NetworkType {
    return this.props.chainId;
  }

  get blockNumber(): number {
    return this.props.blockNumber;
  }

  get transactionHash(): string {
    return this.props.transactionHash;
  }

  get chain(): Chain {
    return this._chain;
  }

  get logIndex(): number {
    return this.props.logIndex;
  }

  get gasUsed(): number {
    return this.props.gasUsed;
  }

  get cumulativeGasUsed(): number {
    return this.props.cumulativeGasUsed;
  }

  get effectiveGasPrice(): number {
    return this.props.effectiveGasPrice;
  }

  set movementType(movementType: JournalMovementType) {
    this.props.movementType = movementType;
  }

  get entryType(): JournalEntryType {
    return this.props.entryType;
  }

  set entryType(entryType: JournalEntryType) {
    this.props.entryType = entryType;
  }

  set entryDate(entryDate: Date) {
    this.props.entryDate = entryDate;
  }
}
