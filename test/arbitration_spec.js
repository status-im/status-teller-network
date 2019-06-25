/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const EthUtil = require('ethereumjs-util');
const TestUtils = require("../utils/testUtils");

const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const Arbitrations = embark.require('Embark/contracts/Arbitrations');
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const StandardToken = embark.require('Embark/contracts/StandardToken');
const EscrowManagement = embark.require('Embark/contracts/EscrowManagement');

const SNT = embark.require('Embark/contracts/SNT');
const StakingPool = embark.require('Embark/contracts/StakingPool');

const ESCROW_CREATED = 0;
const ESCROW_FUNDED = 1;
const _ESCROW_PAID = 2;
const ESCROW_RELEASED = 3;
const ESCROW_CANCELED = 4;

const FIAT = 0;
const _CRYPTO = 1;
const FEE_MILLI_PERCENT = 1000;

let accounts;
let arbitrator, arbitrator2;
let _deltaTime = 0; // TODO: this can be fixed with ganache-cli v7, and evm_revert/snapshot to reset state between tests

const feePercent = 1;

config({
  deployment: {
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
    accounts: [
      {
        mnemonic: "foster gesture flock merge beach plate dish view friend leave drink valley shield list enemy",
        balance: "5 ether",
        numAddresses: "10"
      }
    ]
  },
  contracts: {
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
    License: {
      deploy: false
    },
    SellerLicense: {
      instanceOf: "License",
      args: ["$SNT", 10, "$StakingPool"]
    },
    Arbitrations: {
      args: ["$ArbitrationLicense"]
    },
    ArbitrationLicense: {
      instanceOf: "License",
      args: ["$SNT", 10, "$StakingPool"]
    },
    StakingPool: {
      file: 'staking-pool/contracts/StakingPool.sol',
      args: ["$SNT"]
    },
    MetadataStore: {
      args: ["$SellerLicense", "$ArbitrationLicense"]
    },
    Escrow: {
      args: ["$EscrowRelay", "$SellerLicense", "$Arbitrations", "$MetadataStore", "0x0000000000000000000000000000000000000002", feePercent * 1000]
    },
    EscrowRelay: {
      "args": ["$EscrowManagement", "$MetadataStore"]
    },
    EscrowManagement: {},
    StandardToken: {}
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[8];
  arbitrator2 = accounts[9];
});

contract("Escrow", function() {

  const {toBN} = web3.utils;

  const tradeAmount = 100;
  const feeAmount = Math.round(tradeAmount * (feePercent / 100));

  // util
  let expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
  const expireTransaction = async() => {
    await TestUtils.increaseTime(1001);
    expirationTime += 1000;
  };

  let receipt, escrowId, escrowTokenId, _offerId, ethOfferId, tokenOfferId, hash, signature, nonce;

  this.timeout(0);

  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    const encodedCall = SellerLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(SellerLicense.options.address, 10, encodedCall).send({from: accounts[0]});

    // Register arbitrators
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    await SNT.methods.generateTokens(arbitrator2, 1000).send();

    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator2});

    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;
    receipt  = await MetadataStore.methods.addOffer(StandardToken.options.address, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    tokenOfferId = receipt.events.OfferAdded.returnValues.offerId;

     const abiEncode = Escrow.methods.init(
      EscrowRelay.options.address,
      SellerLicense.options.address,
      Arbitrations.options.address,
      MetadataStore.options.address,
      "0x0000000000000000000000000000000000000002",
      FEE_MILLI_PERCENT
    ).encodeABI();

    await EscrowManagement.methods.setTemplate(Escrow.options.address, abiEncode).send();
  });
  
  describe("Transaction arbitration case", async() => {
    beforeEach(async() => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});
    });

    it("should allow a buyer to open a case", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});

      Escrow.options.jsonInterface.push(Arbitrations.options.jsonInterface.find(x => x.name === "ArbitrationRequired"));

      receipt = await Escrow.methods.openCase('Motive').send({from: accounts[1]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    it("random account cannot open a case for an existing escrow", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});

      try {
        await Escrow.methods.openCase('Motive').send({from: accounts[3]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only a buyer or seller can open a case");
      }
    });

    it("should allow anyone to open an arbitration case on behalf of a buyer", async() => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      let messageToSign = await Escrow.methods.paySignHash().call();
      signature = await web3.eth.sign(messageToSign, accounts[1]);
      receipt = await Escrow.methods['pay(bytes)'](signature).send({from: accounts[9]});

      Escrow.options.jsonInterface.push(Arbitrations.options.jsonInterface.find(x => x.name === "ArbitrationRequired"));

      messageToSign = await Escrow.methods.openCaseSignHash("Motive").call();
      signature = await web3.eth.sign(messageToSign, accounts[1]);
      receipt = await Escrow.methods['openCase(string,bytes)']("Motive", signature).send({from: accounts[9]});

      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    const ARBITRATION_SOLVED_BUYER = 1;
    const ARBITRATION_SOLVED_SELLER = 2;

    it("non arbitrators cannot resolve a case", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});
      await Escrow.methods.openCase('Motive').send({from: accounts[1]});

      try {
        receipt = await Arbitrations.methods.setArbitrationResult(Escrow.options.address, ARBITRATION_SOLVED_BUYER).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only arbitrators can invoke this function");
      }
    });

    it("non selected arbitrator cannot resolve a case", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});
      await Escrow.methods.openCase('Motive').send({from: accounts[1]});

      try {
        receipt = await Arbitrations.methods.setArbitrationResult(Escrow.options.address, ARBITRATION_SOLVED_BUYER).send({from: arbitrator2});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("should allow whoever opened an arbitration to cancel it", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});
      await Escrow.methods.openCase('Motive').send({from: accounts[1]});

      try {
        receipt = await Arbitrations.methods.cancelArbitration(Escrow.options.address).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Arbitration can only be canceled by the opener");
      }
      receipt = await Arbitrations.methods.cancelArbitration(Escrow.options.address).send({from: accounts[1]});
      const arbitrationCanceled = receipt.events.ArbitrationCanceled;
      assert(!!arbitrationCanceled, "ArbitrationCanceled() not triggered");

      assert.strictEqual(arbitrationCanceled.returnValues.item, Escrow.options.address, "Invalid escrowId");
    });

    it("should transfer to buyer if case is solved in their favor", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});
      await Escrow.methods.openCase('Motive').send({from: accounts[1]});

      Arbitrations.options.jsonInterface.push(Escrow.options.jsonInterface.find(x => x.name === "Released"));

      receipt = await Arbitrations.methods.setArbitrationResult(Escrow.options.address, ARBITRATION_SOLVED_BUYER).send({from: arbitrator});
      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");
    });

    it("should cancel escrow if case is solved in favor of the seller", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});
      await Escrow.methods.openCase('Motive').send({from: accounts[1]});

      Arbitrations.options.jsonInterface.push(Escrow.options.jsonInterface.find(x => x.name === "Canceled"));

      receipt = await Arbitrations.methods.setArbitrationResult(Escrow.options.address, ARBITRATION_SOLVED_SELLER).send({from: arbitrator});

      const canceled = receipt.events.Canceled;
      assert(!!canceled, "Canceled() not triggered");
    });

    it("cannot cancel a solved arbitration", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});

      receipt = await Escrow.methods.openCase('Motive').send({from: accounts[1]});
      receipt = await Arbitrations.methods.setArbitrationResult(Escrow.options.address, ARBITRATION_SOLVED_SELLER).send({from: arbitrator});

      try {
        receipt = await Arbitrations.methods.cancelArbitration(Escrow.options.address).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Arbitration already solved or not open");
      }
    });

    it("can open an arbitration on a escrow that had a canceled arbitration before", async() => {
      await Escrow.methods.pay().send({from: accounts[1]});

      receipt = await Escrow.methods.openCase('Motive').send({from: accounts[1]});
      receipt = await Arbitrations.methods.cancelArbitration(Escrow.options.address).send({from: accounts[1]});
      receipt = await Escrow.methods.openCase('Motive').send({from: accounts[1]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
    });

    it("arbitrator should be valid", async () => {
      const isArbitrator = await ArbitrationLicense.methods.isLicenseOwner(arbitrator).call();
      assert.equal(isArbitrator, true, "Invalid arbitrator");

      const nonArbitrator = await ArbitrationLicense.methods.isLicenseOwner(accounts[5]).call();
      assert.equal(nonArbitrator, false, "Account should not be an arbitrator");
    });
  });

});
