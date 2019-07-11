/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const OwnedUpgradeabilityProxy = embark.require('Embark/contracts/OwnedUpgradeabilityProxy');
const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const SNT = embark.require('Embark/contracts/SNT');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');

let accounts, arbitrator;
let receipt;
let ethOfferId;

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

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

let escrowId;

contract("Escrow Relay", function() {
  this.timeout(0);


  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    const encodedCall = SellerLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(SellerLicense.options.address, 10, encodedCall).send({from: accounts[0]});
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

    const abiEncode = Escrow.methods.init(
      EscrowRelay.options.address,
      SellerLicense.options.address,
      ArbitrationLicense.options.address,
      MetadataStore.options.address,
      BURN_ADDRESS, // TODO: replace by StakingPool address
      1000
    ).encodeABI();

    // Here we are setting the initial "template", and calling the init() function
    receipt = await OwnedUpgradeabilityProxy.methods.upgradeToAndCall(Escrow.options.address, abiEncode).send();
    Escrow.options.address = OwnedUpgradeabilityProxy.options.address;

    EscrowRelay.options.jsonInterface.push(Escrow.options.jsonInterface.find(x => x.name === 'Created'));
  });

  it("Can create an escrow", async () => {
    const hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
    const signature = await web3.eth.sign(hash, accounts[1]);
    const nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

    receipt = await EscrowRelay.methods.create(ethOfferId, 123, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
    escrowId = receipt.events.Created.returnValues.escrowId;
  });

  it("User can cancel the escrow ", async () => {
    receipt = await EscrowRelay.methods.cancel(escrowId).send({from: accounts[1]});

    const escrow = await Escrow.methods.transactions(escrowId).call();
    const ESCROW_CANCELED = 4;

    assert.equal(escrow.status, ESCROW_CANCELED);
  });

});
