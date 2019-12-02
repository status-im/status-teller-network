/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const OwnedUpgradeabilityProxy = embark.require('Embark/contracts/OwnedUpgradeabilityProxy');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const SNT = embark.require('Embark/contracts/SNT');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');

let accounts, arbitrator;
let receipt;
let ethOfferId;

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

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

    EscrowRelay: {
      args: ["$MetadataStore", "$OwnedUpgradeabilityProxy", "$SNT"],
      onDeploy: [
        "MetadataStore.methods.setAllowedContract('$EscrowRelay', true).send()"
      ]
    },
    OwnedUpgradeabilityProxy: {
    },
    Escrow: {
      args: ["$accounts[0]", "0x0000000000000000000000000000000000000002", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, 1000],
      onDeploy: [
        "MetadataStore.methods.setAllowedContract('$Escrow', true).send()"
      ]
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

let escrowId;

contract("Escrow Relay", function() {
  this.timeout(0);


  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
    const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
   
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

    const abiEncode = Escrow.methods.init(
      accounts[0],
      EscrowRelay.options.address,
      ArbitrationLicense.options.address,
      MetadataStore.options.address,
      BURN_ADDRESS, // TODO: replace by StakingPool address
      1000
    ).encodeABI();

    // Here we are setting the initial "template", and calling the init() function
    receipt = await OwnedUpgradeabilityProxy.methods.upgradeToAndCall(Escrow.options.address, abiEncode).send();
    Escrow.options.address = OwnedUpgradeabilityProxy.options.address;

    await MetadataStore.methods.setAllowedContract(OwnedUpgradeabilityProxy.options.address, true).send();
    
    EscrowRelay.options.jsonInterface.push(Escrow.options.jsonInterface.find(x => x.name === 'Created'));
  });

  it("Can create an escrow", async () => {
    receipt = await EscrowRelay.methods.createEscrow(ethOfferId, 123, 140, CONTACT_DATA, "L", "U").send({from: accounts[1]});
    escrowId = receipt.events.Created.returnValues.escrowId;
  });

  it("User can cancel the escrow ", async () => {
    receipt = await EscrowRelay.methods.cancel(escrowId).send({from: accounts[1]});

    const escrow = await Escrow.methods.transactions(escrowId).call();
    const ESCROW_CANCELED = 4;

    assert.equal(escrow.status, ESCROW_CANCELED);
  });

});
