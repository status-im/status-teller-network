module.exports = {
  // default applies to all environments
  default: {
    enabled: false,
    ipfs_bin: "ipfs",
    available_providers: ["ipfs"],
    upload: {
      provider: "ipfs",
      host: "localhost",
      port: 5001
    },
    dappConnection: [
      {
        provider: "ipfs",
        host: "localhost",
        port: 5001,
        getUrl: "http://localhost:8080/ipfs/"
      }
    ]
  },

  development: {
    upload: {
      provider: "ipfs",
      host: "localhost",
      port: 5001,
      getUrl: "http://localhost:8080/ipfs/"
    }
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
    enabled: false
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name"
  //custom_name: {
  //}
};
