const LICENSE_PRICE = "1000000000000000000"; // 10 * Math.pow(1, 18)
const ARB_LICENSE_PRICE = "1000000000000000000"; // 10 * Math.pow(10, 18)
const FEE_MILLI_PERCENT = "1000"; // 1 percent
const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";
const MAINNET_OWNER = "0x35f7C96C392cD70ca5DBaeDB2005a946A82e8a95";
const FALLBACK_ARBITRATOR = "0x35f7C96C392cD70ca5DBaeDB2005a946A82e8a95";
const GAS_PRICE = "5000000000"; //5 gwei

// TODO: extract this to .env?


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
    dappAutoEnable: false,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    strategy: 'explicit',

    contracts: {
      Proxy: {
        deploy: false
      },
      License: {
        deploy: false
      },
      SellerLicense: {
        instanceOf: "License",
        args: [
          "$SNT",
          LICENSE_PRICE,
          BURN_ADDRESS  // TODO: replace with "$StakingPool"
        ]
      },
      SellerLicenseProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$SellerLicense"]
      },
      ArbitrationLicense: {
        args: [
          "$SNT",
          ARB_LICENSE_PRICE,
          BURN_ADDRESS  // TODO: replace with "$StakingPool"
        ]
      },
      ArbitrationLicenseProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$ArbitrationLicense"]
      },
      "MetadataStore": {
        args: ["$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS]
      },
      MetadataStoreProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$MetadataStore"]
      },
      "RLPReader": {
        file: 'tabookey-gasless/contracts/RLPReader.sol'
      },
      "RelayHub": {
        file: 'tabookey-gasless/contracts/RelayHub.sol'
      },
      EscrowRelay: {
        args: ["$MetadataStoreProxy", "$EscrowProxy", "$SNT"],
        deps: ['RelayHub']
      },
      Escrow: {
        args: ["$accounts[0]", FALLBACK_ARBITRATOR, "$ArbitrationLicense", "$MetadataStore", "$KyberFeeBurner", FEE_MILLI_PERCENT]
      },
      EscrowProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$Escrow"]
      },
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": { },
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

      /*
      "StakingPool": {
        file: 'staking-pool/contracts/StakingPool.sol',
        args: [
          "$SNT"
        ]
      },
      */

      KyberNetworkProxy: {
      },
      KyberFeeBurner: { // TODO: replace BURN_ADDRESS with "$StakingPool"
        args: ["$SNT", BURN_ADDRESS, "$KyberNetworkProxy", "0x0000000000000000000000000000000000000000", "300"]
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    contracts: {
      StandardToken: { },
      DAI: { instanceOf: "StandardToken", onDeploy: ["DAI.methods.mint('$accounts[0]', '20000000000000000000').send()"] },
      MKR: { instanceOf: "StandardToken", onDeploy: ["MKR.methods.mint('$accounts[0]', '20000000000000000000').send()"] }
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
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, null, null)
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
    gasPrice: GAS_PRICE,
    tracking: 'shared.rinkeby.json',
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/60'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `rinkeby.infura.io/v3/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, null, FALLBACK_ARBITRATOR),
    dappConnection: [
      "$WEB3",
      "https://rinkeby.infura.io/v3/c26e9ab0df094a4f99bd1ea030eb7d50"
    ],
    contracts: {
      StandardToken: { deploy: false },
      DAI: { deploy: false },
      MKR: { deploy: false },
      KyberNetworkProxy: {
        // https://developer.kyber.network/docs/Environments-Rinkeby/
        address: "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76"
      },
      RelayHub: {
        address: '0xd216153c06e857cd7f72665e0af1d7d82172f494'
      },
      EscrowRelay: {
        args: ["$MetadataStoreProxy", "$EscrowProxy", "$SNT"],
        deps: ['RelayHub']
      }
    }
  },

  ropsten: {
    gasPrice: "10000000000",
    tracking: 'shared.ropsten.json',
    contracts: {
      EscrowRelay: {
        args: ["$MetadataStoreProxy", "$EscrowProxy", "$SNT"],
        deps: ['RelayHub']
      },
      Escrow: {
        args: ["0x0000000000000000000000000000000000000000", "$ArbitrationLicenseProxy", "$MetadataStoreProxy", BURN_ADDRESS, FEE_MILLI_PERCENT]
      },
      SNT: {
        address: "0xc55cf4b03948d7ebc8b9e8bad92643703811d162"
      },
      "RLPReader": {
        deploy: false
      },
      "RelayHub": {
        address: "0x1349584869A1C7b8dc8AE0e93D8c15F5BB3B4B87"
      },
      "MiniMeTokenFactory": {
        deploy: false
      },
      KyberNetworkProxy: {
        // https://developer.kyber.network/docs/Environments-Ropsten/
        address: "0x818E6FECD516Ecc3849DAf6845e3EC868087B755"
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
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, MAINNET_OWNER, FALLBACK_ARBITRATOR),
    dappConnection: ["$WEB3"]
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    gasPrice: GAS_PRICE,
    tracking: 'shared.mainnet.json',
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/60'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `mainnet.infura.io/v3/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, MAINNET_OWNER, FALLBACK_ARBITRATOR),
    dappConnection: [
      "$WEB3",
      "https://mainnet.infura.io/v3/c26e9ab0df094a4f99bd1ea030eb7d50"
    ],
    contracts: {
      StandardToken: { deploy: false },
      DAI: { deploy: false },
      MKR: { deploy: false },
      SNT: {
        address: "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
      },
      "RLPReader": { deploy: false },
      "RelayHub": {
        address: "0xd216153c06e857cd7f72665e0af1d7d82172f494"
      },
      "MiniMeTokenFactory": { deploy: false },
      KyberNetworkProxy: {
        // https://developer.kyber.network/docs/Environments-Mainnet/
        address: "0x818E6FECD516Ecc3849DAf6845e3EC868087B755"
      },
      EscrowRelay: {
        args: ["$MetadataStoreProxy", "$EscrowProxy", "$SNT"],
        deps: ['RelayHub'],
        address: "0x4BbCCa869E9931280Cb46AE0DfF18881Be581a4d" 
      },
      SellerLicense: { address: "0xf49BBF077D371a35E8CEB8B23A912184B24eC150" },
      ArbitrationLicense: { address: "0x63f5035069E325AC3b2546BBdC4DF49B244CedfA" },
      SellerLicenseProxy: { address: "0x9e14Ee88715FEB84BC3a2601D7B49d0E8C005498" },
      MetadataStore: { address: "0x137a2417Edb173E43Ccc246Dc76dfeb5281005Cc" },
      ArbitrationLicenseProxy: { address: "0x079A72015Fe55D2F580750fF8Ad7f77ced5a7854" },
      MetadataStoreProxy: { address: "0x333F7D10C3d8F3b0a070C0F6673cF61Bd4a86622" },
      Escrow: { address: "0xcc0Ab31133B71852278fE08D3c8F2a25633b6B92" },
      EscrowProxy: { address: "0x23a6F0bdBd6b5e6DBe5768F3aA68DDC3acF610d8" }
    }
  }
};
