/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  KannaDynamicPriceSaleL2,
  KannaDynamicPriceSaleL2Interface,
} from "../../contracts/KannaDynamicPriceSaleL2";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_knnToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
    ],
    name: "Lock",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountInWEI",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "knnPriceInUSD",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethPriceInUSD",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
    ],
    name: "Purchase",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
    ],
    name: "Unlock",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "CLAIM_MANAGER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "KNN_DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USD_AGGREGATOR_DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "claimManager",
        type: "address",
      },
    ],
    name: "addClaimManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "availableSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "knnPriceInUSD",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "uint16",
        name: "incrementalNonce",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "dueDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
    ],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    name: "claimLocked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "leftoverRecipient",
        type: "address",
      },
    ],
    name: "end",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountInSeconds",
        type: "uint256",
      },
    ],
    name: "getNonceAndDueDate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "knnLocked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "knnToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
    ],
    name: "lockSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceAggregator",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "claimManager",
        type: "address",
      },
    ],
    name: "removeClaimManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInKNN",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ref",
        type: "uint256",
      },
    ],
    name: "unlockSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b50604051620021a2380380620021a28339810160408190526200003491620000fc565b6200003f33620000ac565b6001600160a01b0381166200009a5760405162461bcd60e51b815260206004820152601560248201527f496e76616c696420746f6b656e20616464726573730000000000000000000000604482015260640160405180910390fd5b6001600160a01b03166080526200012e565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156200010f57600080fd5b81516001600160a01b03811681146200012757600080fd5b9392505050565b60805160a05161203262000170600039600061029901526000818161033801528181610b7101528181610d6c01528181610e26015261139e01526120326000f3fe6080604052600436106101ac5760003560e01c80638c4dd39d116100ec578063a512261c1161008a578063d547741f11610064578063d547741f14610510578063e7f30a0614610530578063f2fde38b14610550578063fb1d1f731461057057600080fd5b8063a512261c1461048f578063c9581137146104a7578063cb5a011a146104db57600080fd5b80639e302a48116100c65780639e302a481461041e5780639ec853971461043e578063a217fddf1461045e578063a4a938091461047357600080fd5b80638c4dd39d1461039a5780638da5cb5b146103ba57806391d14854146103d857600080fd5b806336568abe1161015957806367cff9671161013357806367cff967146103265780636befc4661461035a578063715018a6146103705780637ecc2b561461038557600080fd5b806336568abe146102d3578063497980e3146102f357806351cff8d91461030657600080fd5b80632bc43fd91161018a5780632bc43fd9146102475780632f2ff15d146102675780633078fff51461028757600080fd5b806301ffc9a7146101b157806306892e46146101e6578063248a9ca314610208575b600080fd5b3480156101bd57600080fd5b506101d16101cc366004611b3c565b610590565b60405190151581526020015b60405180910390f35b3480156101f257600080fd5b50610206610201366004611b7e565b610629565b005b34801561021457600080fd5b50610239610223366004611ba0565b6000908152600160208190526040909120015490565b6040519081526020016101dd565b34801561025357600080fd5b50610206610262366004611bce565b610744565b34801561027357600080fd5b50610206610282366004611c03565b6107d6565b34801561029357600080fd5b506102bb7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020016101dd565b3480156102df57600080fd5b506102066102ee366004611c03565b610801565b610206610301366004611cd6565b61088d565b34801561031257600080fd5b50610206610321366004611d64565b610c93565b34801561033257600080fd5b506102bb7f000000000000000000000000000000000000000000000000000000000000000081565b34801561036657600080fd5b5061023960025481565b34801561037c57600080fd5b50610206610d1b565b34801561039157600080fd5b50610239610d2f565b3480156103a657600080fd5b506102066103b5366004611d64565b610de6565b3480156103c657600080fd5b506000546001600160a01b03166102bb565b3480156103e457600080fd5b506101d16103f3366004611c03565b60009182526001602090815260408084206001600160a01b0393909316845291905290205460ff1690565b34801561042a57600080fd5b50610206610439366004611d64565b610e93565b34801561044a57600080fd5b50610206610459366004611b7e565b610ec8565b34801561046a57600080fd5b50610239600081565b34801561047f57600080fd5b50610239670de0b6b3a764000081565b34801561049b57600080fd5b506102396305f5e10081565b3480156104b357600080fd5b506102397feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec81565b3480156104e757600080fd5b506104fb6104f6366004611d81565b610fcf565b604080519283526020830191909152016101dd565b34801561051c57600080fd5b5061020661052b366004611c03565b61100b565b34801561053c57600080fd5b5061020661054b366004611d64565b611031565b34801561055c57600080fd5b5061020661056b366004611d64565b611063565b34801561057c57600080fd5b5061020661058b366004611dad565b6110f0565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f7965db0b00000000000000000000000000000000000000000000000000000000148061062357507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b7feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec61065381611277565b826000811161069a5760405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a5908185b5bdd5b9d60921b60448201526064015b60405180910390fd5b836106a3610d2f565b10156106f15760405162461bcd60e51b815260206004820152601460248201527f496e73756666696369656e7420737570706c79210000000000000000000000006044820152606401610691565b83600260008282546107039190611e2e565b909155505060405184815283907f46d326b399b600d54f10f9cc18580fd65427ff111e1ce74350b39e244cbfbcf8906020015b60405180910390a250505050565b7feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec61076e81611277565b82610777610d2f565b10156107c55760405162461bcd60e51b815260206004820152601d60248201527f496e73756666696369656e7420617661696c61626c6520737570706c790000006044820152606401610691565b6107d0848484611281565b50505050565b600082815260016020819052604090912001546107f281611277565b6107fc8383611472565b505050565b6001600160a01b038116331461087f5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201527f20726f6c657320666f722073656c6600000000000000000000000000000000006064820152608401610691565b61088982826114f9565b5050565b824211156108dd5760405162461bcd60e51b815260206004820152601460248201527f5369676e617475726520697320657870697265640000000000000000000000006044820152606401610691565b60008281526006602052604090205460ff161561093c5760405162461bcd60e51b815260206004820152601260248201527f4e6f6e636520616c7265616479207573656400000000000000000000000000006044820152606401610691565b6001600160a01b038716600090815260036020526040902054610960906001611e2e565b8461ffff16146109b25760405162461bcd60e51b815260206004820152600d60248201527f496e76616c6964204e6f6e6365000000000000000000000000000000000000006044820152606401610691565b6305f5e10034116109f65760405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a5908185b5bdd5b9d60921b6044820152606401610691565b806109ff610d2f565b1015610a4d5760405162461bcd60e51b815260206004820152601460248201527f496e73756666696369656e7420737570706c79210000000000000000000000006044820152606401610691565b604080517f3d09a8e8e6203786e29362b57cf17eb62173779a248ba7b9dc96c17becc3659d60208201526001600160a01b038916918101919091526060810187905261ffff8516608082015260a081018490523460c082015260e08101829052610100810183905246610120820152600090610b1190610140015b604051602081830303815290604052805190602001207f19457468657265756d205369676e6564204d6573736167653a0a3332000000006000908152601c91909152603c902090565b90506000610b1f828861157c565b9050610b4b7feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec826115a0565b60405163a9059cbb60e01b81526001600160a01b038a81166004830152602482018590527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303816000875af1158015610bba573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bde9190611e41565b50600083610bec348b611e63565b610bf69190611e7a565b60408051348152602081018c905290810182905290915084906001600160a01b038c16907fd721454499cf9c37b757e03b9d675df451c229048129d6e2d552216a035e6a559060600160405180910390a36000858152600660209081526040808320805460ff191660011790556001600160a01b038d16835260039091528120805491610c8283611e9c565b919050555050505050505050505050565b610c9b611615565b60405147906001600160a01b0383169082156108fc029083906000818181858888f19350505050158015610cd3573d6000803e3d6000fd5b50816001600160a01b03167f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a942436482604051610d0f91815260200190565b60405180910390a25050565b610d23611615565b610d2d600061166f565b565b6002546040517f70a08231000000000000000000000000000000000000000000000000000000008152306004820152600091906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa158015610db3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dd79190611eb5565b610de19190611ece565b905090565b610dee611615565b6000610df8610d2f565b905080156108895760405163a9059cbb60e01b81526001600160a01b038381166004830152602482018390527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303816000875af1158015610e6f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107fc9190611e41565b610e9b611615565b610ec57feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec826114f9565b50565b7feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec610ef281611277565b8260008111610f345760405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a5908185b5bdd5b9d60921b6044820152606401610691565b836002541015610f865760405162461bcd60e51b815260206004820152601b60248201527f496e73756666696369656e74206c6f636b656420737570706c792100000000006044820152606401610691565b8360026000828254610f989190611ece565b909155505060405184815283907f7fd927f00badd96e701196d54745980497c47930f11f838a72a18bca71d3608f90602001610736565b6001600160a01b0382166000908152600360205260408120548190610ff5906001611e2e565b610fff8442611e2e565b915091505b9250929050565b6000828152600160208190526040909120015461102781611277565b6107fc83836114f9565b611039611615565b610ec57feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec82611472565b61106b611615565b6001600160a01b0381166110e75760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610691565b610ec58161166f565b83600081116111325760405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a5908185b5bdd5b9d60921b6044820152606401610691565b8460025410156111845760405162461bcd60e51b815260206004820152601a60248201527f496e73756666696369656e74206c6f636b656420616d6f756e740000000000006044820152606401610691565b604080517fbd8b507d250cb2ec76dc72f32cc756370fb85de72992317c95b3a910d2adc88e60208201526001600160a01b03881691810191909152606081018690526080810185905260a081018390524660c08201526000906111e99060e001610ac8565b905060006111f7828661157c565b90506112237feca77a5bbbcf8baa6d8f93054311a3e6672f982247f67ba40cb896ecf1992aec826115a0565b61122e888888611281565b86600260008282546112409190611ece565b909155506112519050846001611e2e565b6001600160a01b0390981660009081526004602052604090209790975550505050505050565b610ec581336115a0565b81600081116112c35760405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a5908185b5bdd5b9d60921b6044820152606401610691565b6001600160a01b0384166113195760405162461bcd60e51b815260206004820152600f60248201527f496e76616c6964206164647265737300000000000000000000000000000000006044820152606401610691565b60008281526005602052604090205460ff16156113785760405162461bcd60e51b815260206004820152600f60248201527f416c726561647920636c61696d656400000000000000000000000000000000006044820152606401610691565b60405163a9059cbb60e01b81526001600160a01b038581166004830152602482018590527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303816000875af11580156113e7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061140b9190611e41565b5060008281526005602052604090819020805460ff191660011790555182906001600160a01b038616907f34fcbac0073d7c3d388e51312faf357774904998eeb8fca628b9e6f65ee1cbf7906114649087815260200190565b60405180910390a350505050565b60008281526001602090815260408083206001600160a01b038516845290915290205460ff166108895760008281526001602081815260408084206001600160a01b0386168086529252808420805460ff19169093179092559051339285917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d9190a45050565b60008281526001602090815260408083206001600160a01b038516845290915290205460ff16156108895760008281526001602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b600080600061158b85856116d7565b9150915061159881611719565b509392505050565b60008281526001602090815260408083206001600160a01b038516845290915290205460ff16610889576115d38161187e565b6115de836020611890565b6040516020016115ef929190611f05565b60408051601f198184030181529082905262461bcd60e51b825261069191600401611f86565b6000546001600160a01b03163314610d2d5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610691565b600080546001600160a01b038381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600080825160410361170d5760208301516040840151606085015160001a61170187828585611a78565b94509450505050611004565b50600090506002611004565b600081600481111561172d5761172d611fb9565b036117355750565b600181600481111561174957611749611fb9565b036117965760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610691565b60028160048111156117aa576117aa611fb9565b036117f75760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610691565b600381600481111561180b5761180b611fb9565b03610ec55760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c60448201527f75650000000000000000000000000000000000000000000000000000000000006064820152608401610691565b60606106236001600160a01b03831660145b6060600061189f836002611e63565b6118aa906002611e2e565b67ffffffffffffffff8111156118c2576118c2611c33565b6040519080825280601f01601f1916602001820160405280156118ec576020820181803683370190505b5090507f30000000000000000000000000000000000000000000000000000000000000008160008151811061192357611923611fcf565b60200101906001600160f81b031916908160001a9053507f78000000000000000000000000000000000000000000000000000000000000008160018151811061196e5761196e611fcf565b60200101906001600160f81b031916908160001a9053506000611992846002611e63565b61199d906001611e2e565b90505b6001811115611a22577f303132333435363738396162636465660000000000000000000000000000000085600f16601081106119de576119de611fcf565b1a60f81b8282815181106119f4576119f4611fcf565b60200101906001600160f81b031916908160001a90535060049490941c93611a1b81611fe5565b90506119a0565b508315611a715760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610691565b9392505050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115611aaf5750600090506003611b33565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015611b03573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116611b2c57600060019250925050611b33565b9150600090505b94509492505050565b600060208284031215611b4e57600080fd5b81357fffffffff0000000000000000000000000000000000000000000000000000000081168114611a7157600080fd5b60008060408385031215611b9157600080fd5b50508035926020909101359150565b600060208284031215611bb257600080fd5b5035919050565b6001600160a01b0381168114610ec557600080fd5b600080600060608486031215611be357600080fd5b8335611bee81611bb9565b95602085013595506040909401359392505050565b60008060408385031215611c1657600080fd5b823591506020830135611c2881611bb9565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112611c5a57600080fd5b813567ffffffffffffffff80821115611c7557611c75611c33565b604051601f8301601f19908116603f01168101908282118183101715611c9d57611c9d611c33565b81604052838152866020858801011115611cb657600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600080600080600060e0888a031215611cf157600080fd5b8735611cfc81611bb9565b965060208801359550604088013567ffffffffffffffff811115611d1f57600080fd5b611d2b8a828b01611c49565b955050606088013561ffff81168114611d4357600080fd5b9699959850939660808101359560a0820135955060c0909101359350915050565b600060208284031215611d7657600080fd5b8135611a7181611bb9565b60008060408385031215611d9457600080fd5b8235611d9f81611bb9565b946020939093013593505050565b600080600080600060a08688031215611dc557600080fd5b8535611dd081611bb9565b94506020860135935060408601359250606086013567ffffffffffffffff811115611dfa57600080fd5b611e0688828901611c49565b95989497509295608001359392505050565b634e487b7160e01b600052601160045260246000fd5b8082018082111561062357610623611e18565b600060208284031215611e5357600080fd5b81518015158114611a7157600080fd5b808202811582820484141761062357610623611e18565b600082611e9757634e487b7160e01b600052601260045260246000fd5b500490565b600060018201611eae57611eae611e18565b5060010190565b600060208284031215611ec757600080fd5b5051919050565b8181038181111561062357610623611e18565b60005b83811015611efc578181015183820152602001611ee4565b50506000910152565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351611f3d816017850160208801611ee1565b7f206973206d697373696e6720726f6c65200000000000000000000000000000006017918401918201528351611f7a816028840160208801611ee1565b01602801949350505050565b6020815260008251806020840152611fa5816040850160208701611ee1565b601f01601f19169190910160400192915050565b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b600081611ff457611ff4611e18565b50600019019056fea2646970667358221220130318c560162acce9cc7815432732fb0d5ce09f30558d363d3e7c21f7bb2d6c64736f6c63430008150033";

type KannaDynamicPriceSaleL2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: KannaDynamicPriceSaleL2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class KannaDynamicPriceSaleL2__factory extends ContractFactory {
  constructor(...args: KannaDynamicPriceSaleL2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _knnToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<KannaDynamicPriceSaleL2> {
    return super.deploy(
      _knnToken,
      overrides || {}
    ) as Promise<KannaDynamicPriceSaleL2>;
  }
  override getDeployTransaction(
    _knnToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_knnToken, overrides || {});
  }
  override attach(address: string): KannaDynamicPriceSaleL2 {
    return super.attach(address) as KannaDynamicPriceSaleL2;
  }
  override connect(signer: Signer): KannaDynamicPriceSaleL2__factory {
    return super.connect(signer) as KannaDynamicPriceSaleL2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): KannaDynamicPriceSaleL2Interface {
    return new utils.Interface(_abi) as KannaDynamicPriceSaleL2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): KannaDynamicPriceSaleL2 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as KannaDynamicPriceSaleL2;
  }
}
