import {
  ApiResourceEnum,
  DiscountsResourceEnum,
  ImpactfulCultivationResourceEnum,
  ResourceCategoryEnum,
  StockOptionResourceEnum,
  type ResourcesAggregateEnum,
} from './resource-category.enum';
import { ScopeType } from './scope-type.enum';

export enum RoleType {
  /* Admin */
  ADMIN = '0x309', // 777

  /* HOLDER */
  HOLDER = '0x1a4', // 420

  /* Impactful Cultivation */
  IMPACT_CULTIVATION_VALIDATOR = '0x2a01', // 10753
  IMPACT_CULTIVATION_PRODUCER = '0x2a02', // 10754
  IMPACT_CULTIVATION_WORKFLOW_WEBHOOK = '0x2a10', // 10768

  /* Stock Option */
  STOCK_OPTION_USER = '0x3a01', // 14849
  STOCK_OPTION_ADMIN = '0x3a02', // 14850

  /* Promotional Voucher Codes Benefits */
  PROMOTIONAL_SUPPLIER = '0x4a01', // 18945

  /* Website Integration / API */
  WEBSITE_INTEGRATION = '0x5a01', // 23041
  INTERNAL_INTEGRATION = '0x6a02', // 27138
  EXTERNAL_INTEGRATION = '0x7a03', // 31235
}

export type ResourceScopes = Partial<
  Record<ResourcesAggregateEnum, ScopeType[]>
>;

export type ResourceCategoryScopes = Partial<
  Record<ResourceCategoryEnum, ResourceScopes>
>;

export type RoleResources = {
  name: string;
  description: string;
  resources?: ResourceCategoryScopes;
};

export type RoleResourceMap = Record<RoleType, Partial<RoleResources>>;

export const ResourcesByRole: RoleResourceMap = {
  [RoleType.ADMIN]: {
    name: 'SYS_ADMIN',
    description: 'System Administrator',
  },
  [RoleType.HOLDER]: {
    name: 'HOLDER',
    description: 'Holder',
    resources: {
      [ResourceCategoryEnum.DISCOUNT]: {
        [DiscountsResourceEnum.DISCOUNT_VOUCHER]: [ScopeType.READ],
      },
    },
  },
  [RoleType.IMPACT_CULTIVATION_VALIDATOR]: {
    name: 'IMPACT_CULTIVATION_VALIDATOR',
    description: 'Impactful Cultivation Validator',
    resources: {
      [ResourceCategoryEnum.IMPACTFUL_CULTIVATION]: {
        [ImpactfulCultivationResourceEnum.AUDIT_POOL]: [ScopeType.READ],
        [ImpactfulCultivationResourceEnum.VALIDATOR_MANIFEST]: [
          ScopeType.READ,
          ScopeType.WRITE,
          ScopeType.OVERWRITE,
        ],
        [ImpactfulCultivationResourceEnum.VALIDATOR_VEREDICT]: [
          ScopeType.WRITE,
        ],
        [ImpactfulCultivationResourceEnum.PRODUCER_DOCUMENT]: [ScopeType.READ],
      },
    },
  },
  [RoleType.IMPACT_CULTIVATION_PRODUCER]: {
    name: 'IMPACT_CULTIVATION_PRODUCER',
    description: 'Impact Cultivation Producer',
    resources: {
      [ResourceCategoryEnum.IMPACTFUL_CULTIVATION]: {
        [ImpactfulCultivationResourceEnum.AUDIT_POOL]: [
          ScopeType.READ,
          ScopeType.WRITE,
          // ScopeType.OVERWRITE,
        ],
        [ImpactfulCultivationResourceEnum.PRODUCER_DOCUMENT]: [
          ScopeType.WRITE,
          // ScopeType.OVERWRITE,
        ],
      },
    },
  },
  [RoleType.STOCK_OPTION_USER]: {
    name: 'STOCK_OPTION_USER',
    description: 'Stock Option User',
    resources: {
      [ResourceCategoryEnum.STOCK_OPTION]: {
        [StockOptionResourceEnum.STOCK_OPTION_CONTRACT]: [ScopeType.READ],
      },
    },
  },
  [RoleType.STOCK_OPTION_ADMIN]: {
    name: 'STOCK_OPTION_ADMIN',
    description: 'Stock Option Admin',
    resources: {
      [ResourceCategoryEnum.STOCK_OPTION]: {
        [StockOptionResourceEnum.STOCK_OPTION_CONTRACT]: [ScopeType.WRITE],
      },
    },
  },
  [RoleType.PROMOTIONAL_SUPPLIER]: {
    name: 'PROMOTIONAL_SUPPLIER',
    description: 'Promotional Supplier',
    resources: {
      [ResourceCategoryEnum.DISCOUNT]: {
        [DiscountsResourceEnum.DISCOUNT_VOUCHER]: [ScopeType.WRITE],
      },
    },
  },
  [RoleType.WEBSITE_INTEGRATION]: {
    name: 'WEBSITE_INTEGRATION',
    description: 'Website Integration',
    resources: {
      [ResourceCategoryEnum.API]: {
        [ApiResourceEnum.AUTH_CHALLENGE]: [ScopeType.READ],
      },
    },
  },
  [RoleType.INTERNAL_INTEGRATION]: {
    name: 'INTERNAL_INTEGRATION',
    description: 'Internal Services Integration',
    resources: {
      [ResourceCategoryEnum.API]: {
        [ApiResourceEnum.AUTH_CHALLENGE]: [ScopeType.WRITE],
      },
    },
  },
  [RoleType.EXTERNAL_INTEGRATION]: {
    name: 'EXTERNAL_INTEGRATION',
    description: 'External Services/Webhooks Integration',
    resources: {
      [ResourceCategoryEnum.API]: {
        [ApiResourceEnum.AUTH_CHALLENGE]: [ScopeType.WRITE],
      },
    },
  },
  [RoleType.IMPACT_CULTIVATION_WORKFLOW_WEBHOOK]: {
    name: 'IMPACT_CULTIVATION_WORKFLOW_WEBHOOK',
    description: 'Impact Cultivation Workflow Webhook',
    resources: {
      [ResourceCategoryEnum.IMPACTFUL_CULTIVATION]: {
        [ImpactfulCultivationResourceEnum.WORKFLOW_STATUS_WEBHOOK]: [
          ScopeType.WRITE,
        ],
        [ImpactfulCultivationResourceEnum.AUDIT_POOL]: [ScopeType.WRITE],
        [ImpactfulCultivationResourceEnum.PRODUCER]: [ScopeType.WRITE],
        [ImpactfulCultivationResourceEnum.PRODUCER_DOCUMENT]: [ScopeType.WRITE],
      },
    },
  },
};
