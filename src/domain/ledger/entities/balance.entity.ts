import {type Props} from '../../common/entity';
import {LayerType} from '../../common/enums/layer-type.enum';
import {type NetworkType} from '../../common/enums/network-type.enum';
import {SequenceEntity} from '../../common/sequence-entity';
import {type JournalEntryType, type JournalMovementType} from './journal-entry.entity';

export type BalanceProps = {
	account: string;
	group: string;
	total: number;
	[LayerType.L1]: number;
	[LayerType.L2]: number;
	status: JournalEntryType;
	nonce: number;
	joinDate: Date;
	exitDate: Date | undefined;
	lastJournalEntryDate: Date;
	lastJournalMovementType: JournalMovementType;
	lastJournalEntryAmount: number;
	lastJournalEntryChainId: NetworkType;
	checksum: string;
	uint256total: string;
} & Props;

export class Balance extends SequenceEntity<BalanceProps> {
  constructor(props: BalanceProps, id?: number) {
    super(props, id);
  }

  get total(): number {
    return this.props.total;
  }

  set total(total: number) {
    this.props.total = total;
  }

  get status(): JournalEntryType {
    return this.props.status;
  }

  set status(status: JournalEntryType) {
    this.props.status = status;
  }

  get nonce(): number {
    return this.props.nonce;
  }

  set nonce(nonce: number) {
    this.props.nonce = nonce;
  }

  get lastJournalEntryDate(): Date {
    return this.props.lastJournalEntryDate;
  }

  set lastJournalEntryDate(date: Date) {
    this.props.lastJournalEntryDate = date;
  }

  get lastJournalMovementType(): JournalMovementType {
    return this.props.lastJournalMovementType;
  }

  set lastJournalMovementType(movementType: JournalMovementType) {
    this.props.lastJournalMovementType = movementType;
  }

  get lastJournalEntryAmount(): number {
    return this.props.lastJournalEntryAmount;
  }

  set lastJournalEntryAmount(amount: number) {
    this.props.lastJournalEntryAmount = amount;
  }

  get lastJournalEntryChainId(): NetworkType {
    return this.props.lastJournalEntryChainId;
  }

  set lastJournalEntryChainId(chainId: NetworkType) {
    this.props.lastJournalEntryChainId = chainId;
  }

  get joinDate(): Date {
    return this.props.joinDate;
  }

  set joinDate(date: Date) {
    this.props.joinDate = date;
  }

  get exitDate(): Date | undefined {
    return this.props.exitDate;
  }

  set exitDate(date: Date | undefined) {
    this.props.exitDate = date;
  }

  set [LayerType.L1](amount: number) {
    this.props[LayerType.L1] = amount;
  }

  get [LayerType.L1](): number {
    return this.props[LayerType.L1];
  }

  set [LayerType.L2](amount: number) {
    this.props[LayerType.L2] = amount;
  }

  get [LayerType.L2](): number {
    return this.props[LayerType.L2];
  }

  get account(): string {
    return this.props.account;
  }

  set account(account: string) {
    this.props.account = account;
  }

  get group(): string {
    return this.props.group;
  }

  set group(group: string) {
    this.props.group = group;
  }

  get checksum(): string {
    return this.props.checksum;
  }

  set checksum(checksum: string) {
    this.props.checksum = checksum;
  }

  get uint256total(): string {
    return this.props.uint256total;
  }

  set uint256total(uint256total: string) {
    this.props.uint256total = uint256total;
  }
}
