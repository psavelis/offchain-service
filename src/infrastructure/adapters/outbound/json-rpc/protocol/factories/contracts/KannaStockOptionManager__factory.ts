/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  KannaStockOptionManager,
  KannaStockOptionManagerInterface,
} from "../../contracts/KannaStockOptionManager";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "nonce",
        type: "uint16",
      },
    ],
    name: "ContractRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "ContractTemplateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "ContractUnregistered",
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
    inputs: [],
    name: "availableToWithdraw",
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
    name: "contractTemplate",
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
    name: "contracts",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deployContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contract",
        type: "address",
      },
    ],
    name: "hasContract",
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
    inputs: [
      {
        internalType: "address",
        name: "_contract",
        type: "address",
      },
    ],
    name: "registerContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contract",
        type: "address",
      },
    ],
    name: "registerContractUnsafe",
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
    inputs: [],
    name: "totalVested",
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
        internalType: "address",
        name: "_contract",
        type: "address",
      },
    ],
    name: "unregisterContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractTemplate",
        type: "address",
      },
    ],
    name: "updateTemplate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "vestingForecast",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6111708061007e6000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063715018a61161008c578063e322ad2b11610066578063e322ad2b146101e2578063f2fde38b146101ea578063fac2c621146101fd578063fbc1f7181461021057600080fd5b8063715018a6146101b65780638da5cb5b146101be578063d196cd3f146101cf57600080fd5b806322a5dde4116100c857806322a5dde41461015b57806361d93de41461016e5780636c0f79b6146101995780636cd5c39b146101ae57600080fd5b8063199cbc54146100ef5780631a9a6c951461010a5780631b7e921614610146575b600080fd5b6100f7610223565b6040519081526020015b60405180910390f35b610136610118366004610ee0565b6001600160a01b031660009081526001602052604090205460ff1690565b6040519015158152602001610101565b610159610154366004610ee0565b610357565b005b610159610169366004610ee0565b61036b565b600354610181906001600160a01b031681565b6040516001600160a01b039091168152602001610101565b6101a1610459565b6040516101019190610f10565b6101596104bb565b6101596105a1565b6000546001600160a01b0316610181565b6100f76101dd366004610f5d565b6105b5565b6100f76106ee565b6101596101f8366004610ee0565b61081c565b61015961020b366004610ee0565b6108a9565b61015961021e366004610ee0565b610a8d565b600080805b600254811015610351576002818154811061024557610245610f76565b60009182526020918290200154604080517f199cbc5400000000000000000000000000000000000000000000000000000000815290516001600160a01b039092169263199cbc54926004808401938290030181865afa9250505080156102c8575060408051601f3d908101601f191682019092526102c591810190610f8c565b60015b610331576102d4610fa5565b806308c379a0036102f957506102e8610ffc565b806102f357506102fb565b5061033f565b505b3d808015610325576040519150601f19603f3d011682016040523d82523d6000602084013e61032a565b606091505b505061033f565b61033b818461109c565b9250505b80610349816110b5565b915050610228565b50919050565b61035f610bf8565b61036881610c52565b50565b610373610bf8565b6040516301ffc9a760e01b8152630b65b29360e31b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa1580156103be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103e291906110ce565b61035f5760405162461bcd60e51b815260206004820152603c60248201527f605f636f6e747261637460206e6565647320746f20696d706c656d656e74206060448201527f494b616e6e6153746f636b4f7074696f6e6020696e746572666163650000000060648201526084015b60405180910390fd5b606060028054806020026020016040519081016040528092919081815260200182805480156104b157602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610493575b5050505050905090565b6104c3610bf8565b6003546001600160a01b031661051b5760405162461bcd60e51b815260206004820152601d60248201527f436f6e74726163742074656d706c617465206e6f7420646566696e65640000006044820152606401610450565b60008054604051600160a01b90910460f01b7fffff00000000000000000000000000000000000000000000000000000000000016602082015242602282015260420160408051601f1981840301815291905280516020909101206003549091506000906105929083906001600160a01b0316610da2565b905061059d81610c52565b5050565b6105a9610bf8565b6105b36000610e83565b565b600080805b6002548110156106e757600281815481106105d7576105d7610f76565b6000918252602090912001546040517fd196cd3f000000000000000000000000000000000000000000000000000000008152600481018690526001600160a01b039091169063d196cd3f90602401602060405180830381865afa92505050801561065e575060408051601f3d908101601f1916820190925261065b91810190610f8c565b60015b6106c75761066a610fa5565b806308c379a00361068f575061067e610ffc565b806106895750610691565b506106d5565b505b3d8080156106bb576040519150601f19603f3d011682016040523d82523d6000602084013e6106c0565b606091505b50506106d5565b6106d1818461109c565b9250505b806106df816110b5565b9150506105ba565b5092915050565b600080805b600254811015610351576002818154811061071057610710610f76565b60009182526020918290200154604080517fe322ad2b00000000000000000000000000000000000000000000000000000000815290516001600160a01b039092169263e322ad2b926004808401938290030181865afa925050508015610793575060408051601f3d908101601f1916820190925261079091810190610f8c565b60015b6107fc5761079f610fa5565b806308c379a0036107c457506107b3610ffc565b806107be57506107c6565b5061080a565b505b3d8080156107f0576040519150601f19603f3d011682016040523d82523d6000602084013e6107f5565b606091505b505061080a565b610806818461109c565b9250505b80610814816110b5565b9150506106f3565b610824610bf8565b6001600160a01b0381166108a05760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610450565b61036881610e83565b6108b1610bf8565b6001600160a01b03811660009081526001602052604090205460ff166109195760405162461bcd60e51b815260206004820152601760248201527f436f6e7472616374206e6f7420726567697374657265640000000000000000006044820152606401610450565b6001600160a01b0381166000908152600160205260408120805460ff191690555b600254811015610a4c57816001600160a01b03166002828154811061096157610961610f76565b6000918252602090912001546001600160a01b031603610a3a576002805461098b906001906110f0565b8154811061099b5761099b610f76565b600091825260209091200154600280546001600160a01b0390921691839081106109c7576109c7610f76565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b031602179055506002805480610a0657610a06611103565b6000828152602090208101600019908101805473ffffffffffffffffffffffffffffffffffffffff19169055019055610a4c565b80610a44816110b5565b91505061093a565b506040516001600160a01b03821681527f3475b9891ecf29e996feed01eeb42a860ec225283a439d214ffaeac5e006be7d906020015b60405180910390a150565b610a95610bf8565b6040516301ffc9a760e01b8152630b65b29360e31b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa158015610ae0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0491906110ce565b610b9d5760405162461bcd60e51b8152602060048201526044602482018190527f605f636f6e747261637454656d706c61746560206e6565647320746f20696d70908201527f6c656d656e742060494b616e6e6153746f636b4f7074696f6e6020696e74657260648201527f6661636500000000000000000000000000000000000000000000000000000000608482015260a401610450565b6003805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0383169081179091556040519081527fc07699ee6052b5f5e01f277e818a45f7e9077a53b4101ade1686ab652e69d09690602001610a82565b6000546001600160a01b031633146105b35760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610450565b6001600160a01b03811660009081526001602052604090205460ff1615610cbb5760405162461bcd60e51b815260206004820152601b60248201527f436f6e747261637420616c7265616479207265676973746572656400000000006044820152606401610450565b6002805460018082019092557f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace01805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0384169081179091556000908152602082905260408120805460ff191690921790915580547fc40e6bdd3cd85eb8339ecf252859badc1862a5c625694730e39bc686d3544889918391601490610d6990600160a01b900461ffff16611119565b825461ffff9182166101009390930a8381029202191617909155604080516001600160a01b039093168352602083019190915201610a82565b6000808260601b90506040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528160148201527f5af43d82803e903d91602b57fd5bf300000000000000000000000000000000006028820152846037826000f59250506001600160a01b0382166106e75760405162461bcd60e51b815260206004820152602160248201527f437265617465323a204661696c6564206f6e206d696e696d616c206465706c6f60448201527f79000000000000000000000000000000000000000000000000000000000000006064820152608401610450565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600060208284031215610ef257600080fd5b81356001600160a01b0381168114610f0957600080fd5b9392505050565b6020808252825182820181905260009190848201906040850190845b81811015610f515783516001600160a01b031683529284019291840191600101610f2c565b50909695505050505050565b600060208284031215610f6f57600080fd5b5035919050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215610f9e57600080fd5b5051919050565b600060033d1115610fbe5760046000803e5060005160e01c5b90565b601f8201601f1916810167ffffffffffffffff81118282101715610ff557634e487b7160e01b600052604160045260246000fd5b6040525050565b600060443d101561100a5790565b6040516003193d81016004833e81513d67ffffffffffffffff816024840111818411171561103a57505050505090565b82850191508151818111156110525750505050505090565b843d870101602082850101111561106c5750505050505090565b61107b60208286010187610fc1565b509095945050505050565b634e487b7160e01b600052601160045260246000fd5b808201808211156110af576110af611086565b92915050565b6000600182016110c7576110c7611086565b5060010190565b6000602082840312156110e057600080fd5b81518015158114610f0957600080fd5b818103818111156110af576110af611086565b634e487b7160e01b600052603160045260246000fd5b600061ffff80831681810361113057611130611086565b600101939250505056fea26469706673582212200930008c70720980538753751dd2f0283420feb480150e2e5f057b85cc0455cc64736f6c63430008150033";

type KannaStockOptionManagerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: KannaStockOptionManagerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class KannaStockOptionManager__factory extends ContractFactory {
  constructor(...args: KannaStockOptionManagerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<KannaStockOptionManager> {
    return super.deploy(overrides || {}) as Promise<KannaStockOptionManager>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): KannaStockOptionManager {
    return super.attach(address) as KannaStockOptionManager;
  }
  override connect(signer: Signer): KannaStockOptionManager__factory {
    return super.connect(signer) as KannaStockOptionManager__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): KannaStockOptionManagerInterface {
    return new utils.Interface(_abi) as KannaStockOptionManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): KannaStockOptionManager {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as KannaStockOptionManager;
  }
}
