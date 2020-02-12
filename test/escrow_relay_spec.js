/*global contract, config, it, assert, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");
const EscrowInstance = require('Embark/contracts/EscrowInstance');
const EscrowRelay = require('Embark/contracts/EscrowRelay');
const ArbitrationLicense = require('Embark/contracts/ArbitrationLicense');
const SNT = require('Embark/contracts/SNT');
const UserStore = require('Embark/contracts/UserStore');
const OfferStore = require('Embark/contracts/OfferStore');

let accounts, arbitrator;
let receipt;
let ethOfferId;

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

config({
  contracts: {
    deploy: {
      "MiniMeToken": {"deploy": false},
      "MiniMeTokenFactory": {},
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
      UserStore: {
        args: ["$SellerLicense", "$ArbitrationLicense"]
      },
      Medianizer: {

      },
      OfferStore: {
        args: ["$UserStore", "$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS, "$Medianizer"],
        onDeploy: ["UserStore.methods.setAllowedContract('$OfferStore', true).send()"]
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
        args: ["$OfferStore", "$EscrowInstance", "$SNT"],
        onDeploy: [
          "OfferStore.methods.setAllowedContract('$EscrowRelay', true).send()",
          "UserStore.methods.setAllowedContract('$EscrowRelay', true).send()"
        ]
      },
      Escrow: {
        args: ["$accounts[0]", "0x0000000000000000000000000000000000000002", "$ArbitrationLicense", "$OfferStore", "$UserStore", BURN_ADDRESS, 1000],
        onDeploy: [
          "OfferStore.methods.setAllowedContract('$Escrow', true).send()",
          "UserStore.methods.setAllowedContract('$Escrow', true).send()"
        ]
      },
      Proxy: {
        deploy: false
      },
      EscrowInstance: {
        instanceOf: 'Proxy',
        proxyFor: 'Escrow',
        args: ["0x", "$Escrow"]
      },
      TestEscrowUpgrade: {
        args: ["$accounts[0]", "0x0000000000000000000000000000000000000002", "$ArbitrationLicense", "$OfferStore", "$UserStore", BURN_ADDRESS, 1000]
      },
      StandardToken: {}
    }
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
    const amountToStake = await OfferStore.methods.getAmountToStake(accounts[0]).call();
    receipt  = await OfferStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});

    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

    EscrowInstance.methods.init(
      accounts[0],
      EscrowRelay.options.address,
      ArbitrationLicense.options.address,
      OfferStore.options.address,
      UserStore.options.address,
      BURN_ADDRESS, // TODO: replace by StakingPool address
      1000
    ).send({from: accounts[0]});

    await OfferStore.methods.setAllowedContract(EscrowInstance.options.address, true).send();
    await UserStore.methods.setAllowedContract(EscrowInstance.options.address, true).send();

    EscrowRelay.options.jsonInterface.push(EscrowInstance.options.jsonInterface.find(x => x.name === 'Created'));
  });

  it("Can create an escrow", async () => {
    receipt = await EscrowRelay.methods.createEscrow(ethOfferId, 123, 140, accounts[1], CONTACT_DATA, "L", "U").send({from: accounts[1]});
    escrowId = receipt.events.Created.returnValues.escrowId;
  });

  it("User can cancel the escrow ", async () => {
    receipt = await EscrowRelay.methods.cancel(escrowId).send({from: accounts[1]});

    const escrow = await EscrowInstance.methods.transactions(escrowId).call();
    const ESCROW_CANCELED = '4';

    assert.strictEqual(escrow.status, ESCROW_CANCELED);
  });

});
