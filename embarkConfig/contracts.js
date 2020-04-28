const LICENSE_PRICE = "1000000000000000000"; // 10 * Math.pow(1, 18)
const ARB_LICENSE_PRICE = "1000000000000000000"; // 10 * Math.pow(10, 18)
const FEE_MILLI_PERCENT = "1000"; // 1 percent
const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";
const MAINNET_OWNER = "0x35f7C96C392cD70ca5DBaeDB2005a946A82e8a95";
const RINKEBY_OWNER = "0xa019702a5743aFdd607c61321A90C43a8C1c69d9";
const FALLBACK_ARBITRATOR_MAINNET = "0x35f7C96C392cD70ca5DBaeDB2005a946A82e8a95";
const FALLBACK_ARBITRATOR_RINKEBY = "0xa019702a5743aFdd607c61321A90C43a8C1c69d9";
const GAS_PRICE = "5000000000"; //5 gwei

// TODO: extract this to .env?


const dataMigration = require('./data.js');

module.exports = {
  default: {
    dappConnection: [
      "$EMBARK",
      "$WEB3",
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    dappAutoEnable: false,

    gas: "auto",

    strategy: 'explicit',

    deploy: {
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
          "$KyberFeeBurner"  // TODO: replace with "$StakingPool"
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
          "$KyberFeeBurner"  // TODO: replace with "$StakingPool"
        ]
      },
      ArbitrationLicenseProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$ArbitrationLicense"]
      },
      UserStore: {
        args: ["$SellerLicense", "$ArbitrationLicense"]
      },
      Medianizer: {

      },
      OfferStore: {
        args: ["$UserStore", "$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS, "$Medianizer"]
      },
      UserStoreProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$UserStore"]
      },
      OfferStoreProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$OfferStore"]
      },
      "RLPReader": {
        file: 'tabookey-gasless/contracts/RLPReader.sol'
      },
      "RelayHub": {
        file: 'tabookey-gasless/contracts/RelayHub.sol'
      },
      EscrowRelay: {
        args: ["$OfferStoreProxy", "$EscrowProxy", "$SNT"],
        deps: ['RelayHub']
      },
      Escrow: {
        args: ["$accounts[0]", FALLBACK_ARBITRATOR_MAINNET, "$ArbitrationLicense", "$OfferStore", "$UserStore", "$KyberFeeBurner", FEE_MILLI_PERCENT]
      },
      EscrowProxy: {
        instanceOf: "Proxy",
        args: ["0x", "$Escrow"]
      },
      "MiniMeToken": {"deploy": false},
      "MiniMeTokenFactory": {},
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

      KyberNetworkProxy: {},
      KyberFeeBurner: { // TODO: replace BURN_ADDRESS with "$StakingPool"
        args: ["$SNT", BURN_ADDRESS, "$KyberNetworkProxy", "0x0000000000000000000000000000000000000000", "300"]
      }
    }
  },

  development: {
    deploy: {
      StandardToken: {},
      DAI: {instanceOf: "StandardToken", onDeploy: ["DAI.methods.mint('$accounts[0]', '20000000000000000000').send()"]},
      MKR: {instanceOf: "StandardToken", onDeploy: ["MKR.methods.mint('$accounts[0]', '20000000000000000000').send()"]}
    },
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, null, null)
  },

  privatenet: {},

  testnet: {
    gasPrice: GAS_PRICE,
    tracking: 'shared.rinkeby.json',
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, RINKEBY_OWNER, RINKEBY_OWNER),
    dappConnection: [
      "$WEB3",
      "https://rinkeby.infura.io/v3/c26e9ab0df094a4f99bd1ea030eb7d50"
    ],
    deploy: {
      StandardToken: {deploy: false},
      DAI: {deploy: false},
      MKR: {deploy: false},
      KyberNetworkProxy: {
        // https://developer.kyber.network/docs/Environments-Rinkeby/
        address: "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76"
      },
      RLPReader: {
        deploy: false
      },
      RelayHub: {
        address: '0xd216153c06e857cd7f72665e0af1d7d82172f494'
      }
    }
  },

  ropsten: {
    gasPrice: "10000000000",
    tracking: 'shared.ropsten.json',
    deploy: {
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
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, MAINNET_OWNER, FALLBACK_ARBITRATOR_RINKEBY),
    dappConnection: ["$WEB3"]
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    gasPrice: GAS_PRICE,
    tracking: 'shared.mainnet.json',
    afterDeploy: dataMigration.bind(null, GAS_PRICE, LICENSE_PRICE, ARB_LICENSE_PRICE, FEE_MILLI_PERCENT, BURN_ADDRESS, MAINNET_OWNER, FALLBACK_ARBITRATOR_MAINNET),
    dappConnection: [
      "$WEB3",
      "https://mainnet.infura.io/v3/c26e9ab0df094a4f99bd1ea030eb7d50"
    ],
    deploy: {
      StandardToken: {deploy: false},
      DAI: {deploy: false},
      MKR: {deploy: false},
      SNT: {
        address: "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
      },
      "RLPReader": {deploy: false},
      "RelayHub": {
        address: "0xd216153c06e857cd7f72665e0af1d7d82172f494"
      },
      "MiniMeTokenFactory": {deploy: false},
      KyberNetworkProxy: {
        // https://developer.kyber.network/docs/Environments-Mainnet/
        address: "0x818E6FECD516Ecc3849DAf6845e3EC868087B755"
      },
      SellerLicense: {
        address: ""
      },
      SellerLicenseProxy: {
        instanceOf: "Proxy",
        address: ""
      },
      ArbitrationLicense: {
        address: ""
      },
      ArbitrationLicenseProxy: {
        instanceOf: "Proxy",
        address: ""
      },
      UserStore: {
        address: ""
      },
      Medianizer: {
        address: "0x729D19f657BD0614b4985Cf1D82531c67569197B"
      },
      OfferStore: {
        address: ""
      },
      UserStoreProxy: {
        instanceOf: "Proxy",
        address: ""
      },
      OfferStoreProxy: {
        instanceOf: "Proxy",
        address: ""
      },
      EscrowRelay: {
        address: ""
      },
      Escrow: {
        address: ""
      },
      EscrowProxy: {
        instanceOf: "Proxy",
        address: ""
      },
      KyberFeeBurner: {
        address: ""
      }
    }
  }
};
