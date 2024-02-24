export enum ResourceCategoryEnum {
  IMPACTFUL_CULTIVATION = 0xafff, // 45055
  STOCK_OPTION = 0xbfff, // 49151
  DISCOUNT = 0xcfff, // 53247
  REWARDS = 0xdfff, // 57343
  BADGES = 0xefff, // 61439
  API = 0xffff, // 65535
}

/* impact cultivation */
export enum ImpactfulCultivationResourceEnum {
  PRODUCER = 0xa000, // 40960
  PRODUCER_DOCUMENT = 0xa001, // 40961
  AUDIT_POOL = 0xa002, // 40962
  VALIDATOR_MANIFEST = 0xa003, // 40963
  VALIDATOR_VEREDICT = 0xa004, // 40964
  WORKFLOW_STATUS_WEBHOOK = 0xa005, // 40965
  BENCHMARK = 0xa006, // 40966
  EVALUATION_METRIC = 0xa007, // 40967
}

/* stock option */
export enum StockOptionResourceEnum {
  STOCK_OPTION_CONTRACT = 0xb001, // 45057
}

/* discounts */
export enum DiscountsResourceEnum {
  DISCOUNT_VOUCHER = 0xc001, // 49153
}

/* rewards */
export enum RewardsResourceEnum {
  REWARD = 0xd001, // 53249
}

/* badges */
export enum BadgesResourceEnum {
  CUSTOM_MINT = 0xe001, // 57345
}

/* api */
export enum ApiResourceEnum {
  AUTH_CHALLENGE = 0xf001, // 61441
}

export type ResourcesAggregateEnum =
  | ImpactfulCultivationResourceEnum
  | StockOptionResourceEnum
  | DiscountsResourceEnum
  | RewardsResourceEnum
  | BadgesResourceEnum
  | ApiResourceEnum;
