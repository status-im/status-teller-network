const LICENSE_PRICE = "10000000000000000000"; // 10 * Math.pow(10, 18)
const ARB_LICENSE_PRICE = "10000000000000000000"; // 10 * Math.pow(10, 18)


const FEE_AMOUNT = "1000000000000000000"; // 1 * Math.pow(10, 18)
const BURN_ADDRESS = "0x0000000000000000000000000000000000000001";

const dataMigration = require('./data.js');

let secret = {};
try {
  secret = require('../.secret.json');
} catch(err) {
  console.dir("warning: .secret.json file not found; this is only needed to deploy to testnet or livenet etc..");
}

module.exports = {
  // default applies to all environments
  default: {
    // Blockchain node to deploy the contracts
    deployment: {
      host: "localhost", // Host of the blockchain node
      port: 8546, // Port of the blockchain node
      type: "ws" // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
      /*,accounts: [
        {
          privateKey: "your_private_key",
          balance: "5 ether"  // You can set the balance of the account in the dev environment
                              // Balances are in Wei, but you can specify the unit with its name
        },
        {
          privateKeyFile: "path/to/file", // Either a keystore or a list of keys, separated by , or ;
          password: "passwordForTheKeystore" // Needed to decrypt the keystore file
        },
        {
          mnemonic: "12 word mnemonic",
          addressIndex: "0", // Optionnal. The index to start getting the address
          numAddresses: "1", // Optionnal. The number of addresses to get
          hdpath: "m/44'/60'/0'/0/" // Optionnal. HD derivation path
        },
        {
          "nodeAccounts": true // Uses the Ethereum node's accounts
        }
      ]*/
    },
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    strategy: 'implicit',

    contracts: {
      License: {
        deploy: false
      },
      SellerLicense: {
        instanceOf: "License",
        args: [
          "$SNT",
          LICENSE_PRICE
        ]
      },
      "MetadataStore": {
        args: ["$SellerLicense", "$ArbitrationLicense"]
      },
      ArbitrationLicense: {
        instanceOf: "License",
        args: [
          "$SNT",
          ARB_LICENSE_PRICE
        ]
      },
      Escrow: {
        args: ["$SellerLicense", "$ArbitrationLicense", "$MetadataStore", "$SNT", BURN_ADDRESS, FEE_AMOUNT],
        deps: ['RelayHub'],
        onDeploy: [
          "Escrow.methods.setRelayHubAddress('$RelayHub').send()",
          "RelayHub.methods.depositFor('$Escrow').send({value: 1000000000000000000})"
        ]
      },
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": {

      },
      "Fees": {
        "deploy": false
      },
      "SNT": {
        "instanceOf": "MiniMeToken",
        "args": [
          "$MiniMeTokenFactory",
          "0x0000000000000000000000000000000000000000",
          0,
          "TestMiniMeToken",
          18,
          "STT",
          true
        ]
      },
      "RLPReader": {
        file: 'tabookey-gasless/contracts/RLPReader.sol'
      },
      "RelayHub": {
        file: 'tabookey-gasless/contracts/RelayHub.sol'
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    contracts: {
      StandardToken: { },
      DAI: { instanceOf: "StandardToken", onDeploy: ["DAI.methods.mint('$accounts[0]', '20000000000000000000').send()"] },
      MKR: { instanceOf: "StandardToken", onDeploy: ["MKR.methods.mint('$accounts[0]', '20000000000000000000').send()"] },
      // OMG: { instanceOf: "StandardToken" },
      // PPT: { instanceOf: "StandardToken" },
      // REP: { instanceOf: "StandardToken" },
      // POWR: { instanceOf: "StandardToken" },
      // PAY: { instanceOf: "StandardToken" },
      // VRS: { instanceOf: "StandardToken" },
      // GNT: { instanceOf: "StandardToken" },
      // SALT: { instanceOf: "StandardToken" },
      // BNB: { instanceOf: "StandardToken" },
      // BAT: { instanceOf: "StandardToken" },
      // KNC: { instanceOf: "StandardToken" },
      // DGD: { instanceOf: "StandardToken" },
      // AE: { instanceOf: "StandardToken" },
      // TRX: { instanceOf: "StandardToken" },
      // ETHOS: { instanceOf: "StandardToken" },
      // RDN: { instanceOf: "StandardToken" },
      // SNT: { instanceOf: "StandardToken" },
      // SNGLS: { instanceOf: "StandardToken" },
      // GNO: { instanceOf: "StandardToken" },
      // STORJ: { instanceOf: "StandardToken" },
      // ADX: { instanceOf: "StandardToken" },
      // FUN: { instanceOf: "StandardToken" },
      // CVC: { instanceOf: "StandardToken" },
      // ICN: { instanceOf: "StandardToken" },
      // WTC: { instanceOf: "StandardToken" },
      // BTM: { instanceOf: "StandardToken" },
      // ZRX: { instanceOf: "StandardToken" },
      // BNT: { instanceOf: "StandardToken" },
      // MTL: { instanceOf: "StandardToken" },
      // PPP: { instanceOf: "StandardToken" },
      // LINK: { instanceOf: "StandardToken" },
      // KIN: { instanceOf: "StandardToken" },
      // ANT: { instanceOf: "StandardToken" },
      // MGO: { instanceOf: "StandardToken" },
      // MCO: { instanceOf: "StandardToken" },
      // LRC: { instanceOf: "StandardToken" },
      // ZSC: { instanceOf: "StandardToken" },
      // DATA: { instanceOf: "StandardToken" },
      // RCN: { instanceOf: "StandardToken" },
      // WINGS: { instanceOf: "StandardToken" },
      // EDG: { instanceOf: "StandardToken" },
      // MLN: { instanceOf: "StandardToken" },
      // MDA: { instanceOf: "StandardToken" },
      // PLR: { instanceOf: "StandardToken" },
      // QRL: { instanceOf: "StandardToken" },
      // MOD: { instanceOf: "StandardToken" },
      // TAAS: { instanceOf: "StandardToken" },
      // GRID: { instanceOf: "StandardToken" },
      // SAN: { instanceOf: "StandardToken" },
      // SNM: { instanceOf: "StandardToken" },
      // REQ: { instanceOf: "StandardToken" },
      // SUB: { instanceOf: "StandardToken" },
      // MANA: { instanceOf: "StandardToken" },
      // AST: { instanceOf: "StandardToken" },
      // R: { instanceOf: "StandardToken" },
      // 1ST: { instanceOf: "StandardToken" },
      // CFI: { instanceOf: "StandardToken" },
      // ENG: { instanceOf: "StandardToken" },
      // AMB: { instanceOf: "StandardToken" },
      // XPA: { instanceOf: "StandardToken" },
      // OTN: { instanceOf: "StandardToken" },
      // TRST: { instanceOf: "StandardToken" },
      // TKN: { instanceOf: "StandardToken" },
      // RHOC: { instanceOf: "StandardToken" },
      // TGT: { instanceOf: "StandardToken" },
      // EVX: { instanceOf: "StandardToken" },
      // ICOS: { instanceOf: "StandardToken" },
      // DNT: { instanceOf: "StandardToken" },
      // //"٨": { instanceOf: "StandardToken" },
      // EDO: { instanceOf: "StandardToken" },
      // CSNO: { instanceOf: "StandardToken" },
      // COB: { instanceOf: "StandardToken" },
      // ENJ: { instanceOf: "StandardToken" },
      // AVT: { instanceOf: "StandardToken" },
      // TIME: { instanceOf: "StandardToken" },
      // CND: { instanceOf: "StandardToken" },
      // STX: { instanceOf: "StandardToken" },
      // XAUR: { instanceOf: "StandardToken" },
      // VIB: { instanceOf: "StandardToken" },
      // PRG: { instanceOf: "StandardToken" },
      // DPY: { instanceOf: "StandardToken" },
      // CDT: { instanceOf: "StandardToken" },
      // TNT: { instanceOf: "StandardToken" },
      // DRT: { instanceOf: "StandardToken" },
      // SPANK: { instanceOf: "StandardToken" },
      // BRLN: { instanceOf: "StandardToken" },
      // USDC: { instanceOf: "StandardToken" },
      // LPT: { instanceOf: "StandardToken" },
      // ST: { instanceOf: "StandardToken" }
    },
    deployment: {
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
      accounts: [
        {
          nodeAccounts: true
        },
        {
          mnemonic: "foster gesture flock merge beach plate dish view friend leave drink valley shield list enemy",
          balance: "5 ether",
          numAddresses: "10"
        }
      ]
    },
    afterDeploy: dataMigration.bind(null, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_AMOUNT)
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
    tracking: 'shared.chains.json',
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/60'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `rinkeby.infura.io/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    afterDeploy: dataMigration.bind(null, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_AMOUNT),
    dappConnection: ["$WEB3"]
  },

  ropsten: {
    tracking: 'shared.ropsten.chains.json',
    contracts: {
      Escrow: {
        args: ["$SellerLicense", "$ArbitrationLicense", "$MetadataStore", "$SNT", BURN_ADDRESS, FEE_AMOUNT],
        deps: ['RelayHub'],
        onDeploy: [
          "Escrow.methods.setRelayHubAddress('$RelayHub').send()",
          "RelayHub.methods.depositFor('$Escrow').send({value: 300000000000000000})"
        ]
      },
      SNT: {
        address: "0xc55cf4b03948d7ebc8b9e8bad92643703811d162"
      },
      "RLPReader": {
        deploy: false
      },
      "RelayHub": {
        address: "0x1349584869A1C7b8dc8AE0e93D8c15F5BB3B4B87"
      }
    },
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/60'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `ropsten.infura.io/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    afterDeploy: dataMigration.bind(null, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_AMOUNT),
    dappConnection: ["$WEB3"]
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
  }

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
