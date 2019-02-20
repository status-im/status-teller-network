const LICENSE_PRICE = "10000000000000000000"; // 10 * Math.pow(10, 18)

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
        args: [
          "$SNT",
          "0x0000000000000000000000000000000000000000",
          LICENSE_PRICE,
          86400 * 365
        ]
      },
      Escrow: {
        args: ["$License", "$accounts[1]"]
      },
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": {

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
      "MetadataStore": {
        args: ["$License"]
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
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
    afterDeploy: async (deps) => {
      const addresses = await deps.web3.eth.getAccounts();
      const main = addresses[0];
      const sntToken = 100;
      const balance = await deps.contracts.SNT.methods.balanceOf(main).call();
      if (balance !== '0') {
        return;
      }

      console.log("Seeding data...");

      console.log('Send ETH...');
      const value = 100 * Math.pow(10, 18);
      await Promise.all(addresses.slice(1, 10).map(async (address) => {
        return deps.web3.eth.sendTransaction({
          to: address,
          from: main,
          value: value.toString()
        });
      }));

      console.log('Generate SNT...');
      const weiSnt = sntToken * Math.pow(10, 18);
      await Promise.all(addresses.slice(0, 8).map(async (address) => {
        const generateToken = deps.contracts.SNT.methods.generateTokens(address, weiSnt.toString());
        const gas = await generateToken.estimateGas({from: main});
        return generateToken.send({from: main, gas});    
      }));

      console.log('Buy Licenses...');
      await Promise.all(addresses.slice(1, 8).map(async (address) => {
        const buyLicense = deps.contracts.License.methods.buy().encodeABI();
        const toSend = deps.contracts.SNT.methods.approveAndCall(deps.contracts.License._address, LICENSE_PRICE, buyLicense);
        
        const gas = await toSend.estimateGas({from: address});
        return toSend.send({from: address, gas});
      }));
      
      console.log('Generating Offers...');
      const tokens = [deps.contracts.SNT._address, '0x0000000000000000000000000000000000000000'];
      const paymentMethods = [0, 1, 2];
      const usernames = ['Jonathan', 'Iuri', 'Anthony', 'Barry', 'Richard', 'Ricardo'];
      const locations = ['London', 'Montreal', 'Paris', 'Berlin'];
      const currencies = ['USD', 'EUR'];
      const marketTypes = [0, 1];
      
      await Promise.all(addresses.slice(1, 5).map(async (address) => {
        const addOffer = deps.contracts.MetadataStore.methods.addOffer(
          tokens[Math.floor(Math.random()*tokens.length)],
          address,
          locations[Math.floor(Math.random()*locations.length)],
          currencies[Math.floor(Math.random()*currencies.length)],
          usernames[Math.floor(Math.random()*usernames.length)],
          [paymentMethods[Math.floor(Math.random()*paymentMethods.length)]],
          marketTypes[Math.floor(Math.random()*marketTypes.length)],
          Math.floor(Math.random() * 100)
        );

        const gas = await addOffer.estimateGas({from: address});
        return addOffer.send({from: address, gas});
      }));

      const accounts = await Promise.all(addresses.map(async(address) => {
        const ethBalance = await deps.web3.eth.getBalance(address);
        const sntBalance = await deps.contracts.SNT.methods.balanceOf(address).call();
        const isLicenseOwner = await deps.contracts.License.methods.isLicenseOwner(address).call();
        let user = {};
        let offers = [];
        const isUser = await deps.contracts.MetadataStore.methods.userWhitelist(address).call();
        if (isUser) {
          const userId = await deps.contracts.MetadataStore.methods.addressToUser(address).call();
          user = await deps.contracts.MetadataStore.methods.users(userId).call();
          const offerIds = await deps.contracts.MetadataStore.methods.getOfferIds(address).call();
          offers = await Promise.all(offerIds.map(async(offerId) => (
            deps.contracts.MetadataStore.methods.offer(offerId).call()
          )));
        }
        return {
          address,
          isLicenseOwner,
          isUser,
          user,
          offers,
          ethBalance: deps.web3.utils.fromWei(ethBalance),
          sntBalance: deps.web3.utils.fromWei(sntBalance)
        };
      }));

      console.log('Summary:');
      console.log('######################');
      accounts.forEach((account) => {
        console.log(`Address: ${account.address}:`);
        console.log(`License Owner: ${account.isLicenseOwner} ETH: ${account.ethBalance} SNT: ${account.sntBalance}`);
        console.log(`Is User: ${account.isUser} Username: ${account.user.username || 'N/A'} Offers: ${account.offers.length}`);
        console.log('');
      });
    }
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
