let secret = {};
try {
  secret = require('../.secret.json');
} catch(err) {
  console.dir("warning: .secret.json file not found; this is only needed to deploy to testnet or livenet etc..");
}

module.exports = {
  // applies to all environments
  default: {
    enabled: true,
    client: "geth",

    // Accounts to use as node accounts
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
    accounts: [
      {
        nodeAccounts: true, // Accounts use for the node
        numAddresses: 2, // Number of addresses/accounts (defaults to 1)
        password: "embarkConfig/development/password" // Password file for the accounts
      }
    ]
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run` and `embark blockchain`
  development: {
    clientConfig: {
      miningMode: 'dev'
    },
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

  // merges with the settings in default
  // used with "embark run privatenet" and/or "embark blockchain privatenet"
  privatenet: {
    accounts: [
      {
        nodeAccounts: true,
        password: "embarkConfig/privatenet/password" // Password to unlock the account
      }
    ],
    clientConfig: {
      datadir: ".embark/privatenet/datadir", // Data directory for the databases and keystore
      miningMode: 'auto',
      genesisBlock: "config/privatenet/genesis.json" // Genesis block to initiate on first creation of a development node
    }
  },

  privateparitynet: {
    client: "parity",
    genesisBlock: "embarkConfig/privatenet/genesis-parity.json",
    datadir: ".embark/privatenet/datadir",
    miningMode: 'off'
  },

  externalnode: {
    endpoint: "URL_OF_THE_NODE", // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      {
        mnemonic: "YOUR_MNEMONIC",
        hdpath: "m/44'/60'/0'/0/",
        numAddresses: "1"
      }
    ]
  },

  testnet: {
    networkType: "testnet", // Can be: testnet(ropsten), rinkeby, livenet or custom, in which case, it will use the specified networkId
    networkId: 4,
    endpoint: `https://rinkeby.infura.io/${secret.infuraKey}`,
    accounts: [
      {
        mnemonic: secret.mnemonic,
        hdpath: secret.hdpath || "m/44'/60'/0'/0/",
        numAddresses: "10"
      }
    ]
  },

  ropsten: {
    endpoint: `https://ropsten.infura.io/${secret.infuraKey}`,
    accounts: [
      {
        mnemonic: secret.mnemonic,
        hdpath: secret.hdpath || "m/44'/60'/0'/0/",
        numAddresses: "10"
      }
    ]
  },

  livenet: {
    networkType: "livenet",
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/livenet/password"
      }
    ]
  }

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
