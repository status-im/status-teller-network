/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const OwnedUpgradeabilityProxy = embark.require('Embark/contracts/OwnedUpgradeabilityProxy');
const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const SNT = embark.require('Embark/contracts/SNT');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const TestEscrowUpgrade = embark.require('Embark/contracts/TestEscrowUpgrade');

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const PUBKEY_A = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PUBKEY_B = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

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
      args: ["$SellerLicense", "$ArbitrationLicense"]
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

    EscrowRelay: {
      args: ["$MetadataStore", "$OwnedUpgradeabilityProxy", "$SNT"],
    },
    OwnedUpgradeabilityProxy: {
    },
    Escrow: {
      args: ["0x0000000000000000000000000000000000000002", "$SellerLicense", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, 1000]
    },
    TestEscrowUpgrade: {
      args: ["0x0000000000000000000000000000000000000002", "$SellerLicense", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, 1000]
    },
    StandardToken: { }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[8];
});

contract("Escrow Funding", function() {
  this.timeout(0);

  describe("Upgradeable Escrows", async () => {

    before(async () => {
      await SNT.methods.generateTokens(accounts[0], 1000).send();
      const encodedCall = SellerLicense.methods.buy().encodeABI();
      await SNT.methods.approveAndCall(SellerLicense.options.address, 10, encodedCall).send({from: accounts[0]});
      await SNT.methods.generateTokens(arbitrator, 1000).send();
      const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
      await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
      await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
      receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, PUBKEY_A, PUBKEY_B, "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;
    });


    it("Can create initial escrow version", async () => {
      const abiEncode = Escrow.methods.init(
        EscrowRelay.options.address,
        SellerLicense.options.address,
        ArbitrationLicense.options.address,
        MetadataStore.options.address,
        "0x0000000000000000000000000000000000000002", // TODO: replace by StakingPool address
        1000
      ).encodeABI();

      // Here we are setting the initial "template", and calling the init() function
      receipt = await OwnedUpgradeabilityProxy.methods.upgradeToAndCall(Escrow.options.address, abiEncode).send();
      Escrow.options.address = OwnedUpgradeabilityProxy.options.address;
    });

    it("Can create an escrow", async () => {
      const hash = await MetadataStore.methods.getDataHash("U", PUBKEY_A, PUBKEY_B).call({from: accounts[1]});
      const signature = await web3.eth.sign(hash, accounts[1]);
      const nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await Escrow.methods.createEscrow(ethOfferId, 123, 140, PUBKEY_A, PUBKEY_B, "L", "U", nonce, signature).send({from: accounts[1]});
      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");
      assert.equal(created.returnValues.offerId, ethOfferId, "Invalid offerId");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    });

    it("Can upgrade contract", async () => {
      // This is an upgrade without calling an initialization function.
      // Some upgrades might require doing that, so you need to call upgradeToAndCall
      // and set some initialization var
      receipt = await OwnedUpgradeabilityProxy.methods.upgradeTo(TestEscrowUpgrade.options.address).send();
      TestEscrowUpgrade.options.address = OwnedUpgradeabilityProxy.options.address;
    });

    it("Can call new contract functions", async () => {
      const val = 5;
      await TestEscrowUpgrade.methods.setVal(val).send();
      const currentVal = await TestEscrowUpgrade.methods.getVal().call();
      assert.equal(val, currentVal);
    });
  });
});
