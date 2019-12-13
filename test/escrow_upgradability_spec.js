/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const Proxy = embark.require('Embark/contracts/Proxy');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const SNT = embark.require('Embark/contracts/SNT');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const TestEscrowUpgrade = embark.require('Embark/contracts/TestEscrowUpgrade');

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";


let accounts, arbitrator;
let receipt;
let ethOfferId;

config({
  deployment: {
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
  },
  contracts: {
    "MiniMeToken": { "deploy": false },
    "MiniMeTokenFactory": { },
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
    License: {
      deploy: false
    },
    SellerLicense: {
      instanceOf: "License",
      args: ["$SNT", 10, BURN_ADDRESS]
    },
    MetadataStore: {
      args: ["$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS]
    },
    ArbitrationLicense: {
      args: ["$SNT", 10, BURN_ADDRESS]
    },

    /*
    StakingPool: {
      file: 'staking-pool/contracts/StakingPool.sol',
      args: ["$SNT"]
    },
    */

    Proxy: {
      args: ["0x", "$Escrow"]
    },
    
    EscrowRelay: {
      args: ["$MetadataStore", "$Proxy", "$SNT"]
    },
    
    Escrow: {
      args: ["$accounts[0]", "0x0000000000000000000000000000000000000002", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, 1000]
    },
    TestEscrowUpgrade: {
      args: ["$accounts[0]", "0x0000000000000000000000000000000000000002", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, 1000]
    },
    StandardToken: { }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[8];
});

contract("Escrow", function() {
  this.timeout(0);

  describe("Upgradeable Escrows", async () => {

    before(async () => {
      Escrow.options.address = Proxy.options.address;

      await MetadataStore.methods.setAllowedContract(Escrow.options.address, true).send();
      await MetadataStore.methods.setAllowedContract(EscrowRelay.options.address, true).send();

      await SNT.methods.generateTokens(accounts[0], 1000).send();
      await SNT.methods.generateTokens(arbitrator, 1000).send();
      const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
      await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
      await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;
    });


    it("Can create initial escrow version", async () => {
     
      // Here we are setting the initial "template" by calling the init() function
      Escrow.methods.init(
        accounts[0],
        EscrowRelay.options.address,
        ArbitrationLicense.options.address,
        MetadataStore.options.address,
        "0x0000000000000000000000000000000000000002", // TODO: replace by StakingPool address
        1000
      ).send({from: accounts[0]});

    });

    it("Can create an escrow", async () => {
      receipt = await Escrow.methods.createEscrow(ethOfferId, 123, 140, accounts[1], CONTACT_DATA, "L", "U").send({from: accounts[1]});
      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");
      assert.equal(created.returnValues.offerId, ethOfferId, "Invalid offerId");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    });

    it("Can create an escrow using a signature", async () => {
      const hash = await MetadataStore.methods.getDataHash("U", CONTACT_DATA).call({from: accounts[1]});
      const signature = await web3.eth.sign(hash, accounts[1]);
      const nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await Escrow.methods.createEscrow(ethOfferId, 123, 140, accounts[1], CONTACT_DATA, "L", "U", nonce, signature).send({from: accounts[1]});
      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");
      assert.equal(created.returnValues.offerId, ethOfferId, "Invalid offerId");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    });

    it("Can upgrade contract", async () => {
      receipt = await Escrow.methods.updateCode(TestEscrowUpgrade.options.address).send();
      TestEscrowUpgrade.options.address = Escrow.options.address;
    });

    it("Can call new contract functions", async () => {
      const val = 5;
      await TestEscrowUpgrade.methods.setVal(val).send();
      const currentVal = await TestEscrowUpgrade.methods.getVal().call();
      assert.equal(val, currentVal);
    });
  });
});
