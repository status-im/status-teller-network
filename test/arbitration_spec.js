/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");

const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const Escrow = embark.require('Embark/contracts/Escrow');
const SNT = embark.require('Embark/contracts/SNT');

let accounts;
let arbitrator, arbitrator2, blacklistedAccount;

const feePercent = 1;
const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const PUBKEY_A = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PUBKEY_B = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";


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
    ArbitrationLicense: {
      args: ["$SNT", 10, BURN_ADDRESS]
    },
    SellerLicense: {
      instanceOf: "License",
      args: ["$SNT", 10, BURN_ADDRESS]
    },
    
    /*
    StakingPool: {
      file: 'staking-pool/contracts/StakingPool.sol',
      args: ["$SNT"]
    },
    */
    MetadataStore: {
      args: ["$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS]
    },
    Escrow: {
      args: ["0x0000000000000000000000000000000000000000", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, feePercent * 1000],
      onDeploy: ["MetadataStore.methods.setAllowedContract('$Escrow', true).send()"]
    },
    StandardToken: {
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[8];
  arbitrator2 = accounts[9];
  blacklistedAccount = accounts[5];
});

contract("Escrow", function() {

  const tradeAmount = 100;
  const feeAmount = Math.round(tradeAmount * (feePercent / 100));

  let receipt, escrowId, ethOfferId, hash, signature, nonce;
  let created;

  this.timeout(0);

  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    await SNT.methods.generateTokens(blacklistedAccount, 1000).send();

    // Register arbitrators
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    await SNT.methods.generateTokens(arbitrator2, 1000).send();

    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator2});
    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator2});
    await ArbitrationLicense.methods.blacklistSeller(blacklistedAccount).send({from: arbitrator});

    const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();

    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, PUBKEY_A, PUBKEY_B, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;
  });

  describe("Arbitrations", async() => {
    beforeEach(async() => {
      // Create
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, PUBKEY_A, PUBKEY_B, "L", "U").send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;
      // Fund
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});
    });

    it("should allow a buyer to open a case", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      receipt = await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    it("random account cannot open a case for an existing escrow", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      try {
        await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[3]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only participants can invoke this function");
      }
    });

    it("should allow anyone to open an arbitration case on behalf of a buyer", async() => {
      let messageToSign, signature;

      // Create
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, PUBKEY_A, PUBKEY_B, "L", "U").send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;
      // Fund
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});

      messageToSign = await Escrow.methods.paySignHash(escrowId).call();
      signature = await web3.eth.sign(messageToSign, accounts[1]);

      receipt = await Escrow.methods['pay(uint256,bytes)'](escrowId, signature).send({from: accounts[8]});

      messageToSign = await Escrow.methods.openCaseSignHash(escrowId, "My motive is...").call();
      signature = await web3.eth.sign(messageToSign, accounts[1]);

      receipt = await Escrow.methods['openCase(uint256,string,bytes)'](escrowId, "My motive is...", signature).send({from: accounts[9]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    const ARBITRATION_SOLVED_BUYER = 1;
    const ARBITRATION_SOLVED_SELLER = 2;

    it("non arbitrators cannot resolve a case", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      try {
        receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only arbitrators can invoke this function");
      }
    });

    it("non selected arbitrator cannot resolve a case", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      try {
        receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrator2});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("should allow whoever opened an arbitration to cancel it", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      receipt = await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      try {
        receipt = await Escrow.methods.cancelArbitration(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Arbitration can only be canceled by the opener");
      }

      receipt = await Escrow.methods.cancelArbitration(escrowId).send({from: accounts[1]});
      const arbitrationCanceled = receipt.events.ArbitrationCanceled;
      assert(!!arbitrationCanceled, "ArbitrationCanceled() not triggered");
      assert.strictEqual(arbitrationCanceled.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    it("should transfer to buyer if case is solved in their favor", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrator});
      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");
    });

    it("should cancel escrow if case is solved in favor of the seller", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_SELLER).send({from: arbitrator});

      const released = receipt.events.Canceled;
      assert(!!released, "Canceled() not triggered");
    });

    it("cannot cancel a solved arbitration", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      receipt = await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});
      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_SELLER).send({from: arbitrator});

      try {
        receipt = await Escrow.methods.cancelArbitration(escrowId).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Arbitration already solved or not open");
      }
    });

    it("can open an arbitration on a escrow that had a canceled arbitration before", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      receipt = await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});
      receipt = await Escrow.methods.cancelArbitration(escrowId).send({from: accounts[1]});
      receipt = await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
    });

    it("arbitrator should be valid", async () => {
      const isArbitrator = await ArbitrationLicense.methods.isLicenseOwner(arbitrator).call();
      assert.equal(isArbitrator, true, "Invalid arbitrator");

      const nonArbitrator = await ArbitrationLicense.methods.isLicenseOwner(accounts[5]).call();
      assert.equal(nonArbitrator, false, "Account should not be an arbitrator");
    });

    it("should not be able to rate an open dispute", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId, 'Motive').send({from: accounts[1]});

      try {
        await Escrow.methods.rateTransaction(escrowId, 2).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Transaction not completed yet");
      }

      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrator});

      await Escrow.methods.rateTransaction(escrowId, 2).send({from: accounts[1]});
    });

    it('should not allow a blacklisted seller to open an offer', async () => {
      try {
        const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
        await MetadataStore.methods.addOffer(TestUtils.zeroAddress, PUBKEY_A, PUBKEY_B, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: blacklistedAccount, value: amountToStake});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Arbitrator does not allow this transaction");
      }
    });
  });

});
