/*global contract, config, it, assert, embark, web3*/
const EthUtil = require('ethereumjs-util');
const TestUtils = require("../utils/testUtils");

const License = embark.require('Embark/contracts/License');
const Escrow = embark.require('Embark/contracts/Escrow');
const StandardToken = embark.require('Embark/contracts/StandardToken');
const SNT = embark.require('Embark/contracts/SNT');

let accounts;
let arbitrer;
let deltaTime = 0; // TODO: this can be fixed with ganache-cli v7, and evm_revert/snapshot to reset state between tests

config({
  deployment: {
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
    accounts: [
      {
        mnemonic: "foster gesture flock merge beach plate dish view friend leave drink valley shield list enemy",
        balance: "5 ether",
        numAddresses: "10",
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
      args: ["$SNT", TestUtils.zeroAddress, 10, 86400 * 365]
    },
    Escrow: {
      args: ["$License", "$accounts[5]"]
    },
    StandardToken: {
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrer = accounts[5];
});

contract("Escrow", function() {
  const {toBN} = web3.utils;
  const value = web3.utils.toWei("0.1", "ether");

  // util
  let expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
  const expireTransaction = async() => {
    await TestUtils.increaseTime(1001);
    expirationTime += 1000;
  }

  let receipt, escrowId, escrowTokenId;

  this.timeout(0);

  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    const encodedCall = License.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(License.options.address, 10, encodedCall).send({from: accounts[0]});
  });

  describe("Creating a new escrow", async () => {
    it("Non-seller must not be able to create escrows", async () => {
      try {
        await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[8], value});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Seller should be able to create escrows", async () => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});

      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");
      assert.equal(created.returnValues.seller, accounts[0], "Invalid seller");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");

      escrowId = created.returnValues.escrowId;
    });

    it("Escrow should contain valid data", async () => {
      const contractBalance = await web3.eth.getBalance(Escrow.options.address);
      assert.equal(contractBalance, value, "Invalid contract balance");

      const escrow = await Escrow.methods.transactions(escrowId).call();

      assert.equal(escrow.seller, accounts[0], "Invalid seller");
      assert.equal(escrow.buyer, accounts[1], "Invalid buyer");
      assert.equal(escrow.amount, value, "Invalid amount");
      assert.equal(escrow.expirationTime, expirationTime, "Invalid expirationTime");
      assert.equal(escrow.released, false, "Should not be released");
      assert.equal(escrow.canceled, false, "Should not be canceled");
    });

    it("Escrows can be created with ERC20 tokens", async () => {
      await StandardToken.methods.mint(accounts[0], value).send();

      const balanceBeforeCreation = await StandardToken.methods.balanceOf(accounts[0]).call();

      await StandardToken.methods.approve(Escrow.options.address, value).send({from: accounts[0]});

      receipt = await Escrow.methods.create(accounts[1], value, StandardToken.options.address, expirationTime).send({from: accounts[0]});

      const created = receipt.events.Created;

      assert(!!created, "Created() not triggered");

      escrowTokenId = receipt.events.Created.returnValues.escrowId;

      const balanceAfterCreation = await StandardToken.methods.balanceOf(accounts[0]).call();

      assert(toBN(balanceAfterCreation), toBN(balanceBeforeCreation).sub(toBN(value)), "Token value wasn't deducted");

      const contractBalance = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert(toBN(contractBalance), toBN(value), "Contract token balance is incorrect");

      const escrow = await Escrow.methods.transactions(escrowTokenId).call();

      assert.equal(escrow.token, StandardToken.options.address, "Invalid token address");
      assert.equal(escrow.amount, value, "Invalid amount");
    });
  });


  describe("Canceling an escrow", async () => {
    let created;

    it("A seller can cancel their ETH escrows", async () => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      await expireTransaction();

      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

      let Canceled = receipt.events.Canceled;
      assert(!!Canceled, "Canceled() not triggered");

      let escrow = await Escrow.methods.transactions(escrowId).call();
      assert.equal(escrow.canceled, true, "Should have been canceled");
    });

    it("A seller can cancel their token escrows", async () => {
      await StandardToken.methods.mint(accounts[0], value).send();
      await StandardToken.methods.approve(Escrow.options.address, value).send({from: accounts[0]});

      const balanceBeforeCreation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceBeforeCreation = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      receipt = await Escrow.methods.create(accounts[1], value, StandardToken.options.address, expirationTime).send({from: accounts[0]});

      escrowTokenId = receipt.events.Created.returnValues.escrowId;
      
      await expireTransaction();

      await Escrow.methods.cancel(escrowTokenId).send({from: accounts[0]});

      const balanceAfterCancelation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceAfterCancelation = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      escrow = await Escrow.methods.transactions(escrowTokenId).call();

      assert.equal(escrow.canceled, true, "Should have been canceled");
      assert.equal(balanceBeforeCreation, balanceAfterCancelation, "Invalid seller balance");
      assert.equal(contractBalanceBeforeCreation, contractBalanceAfterCancelation, "Invalid contract balance");
    });

    it("An escrow can only be canceled once", async () => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      escrowId = receipt.events.Created.returnValues.escrowId;
      
      try {
        receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Accounts different from the escrow owner cannot cancel escrows", async() => {
      receipt = await Escrow.methods.create(accounts[1], "1", TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value: "1"});
      escrowId = receipt.events.Created.returnValues.escrowId;

      try {
        receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[1]}); // Buyer tries to cancel
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });
  });


  describe("Releasing escrows", async () => {
    beforeEach(async() => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      escrowId = receipt.events.Created.returnValues.escrowId;
    });

    it("An invalid escrow cannot be released", async() => {
      try {
        await Escrow.methods.release(999).send({from: accounts[0]}); // Invalid escrow
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Accounts different from the escrow owner cannot release an escrow", async () => {
      try {
        await Escrow.methods.release(escrowId).send({from: accounts[1]}); // Buyer tries to release
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Escrow owner can release his funds to the buyer", async () => {
      const buyerBalanceBeforeEscrow = await web3.eth.getBalance(accounts[1]);
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      const buyerBalanceAfterEscrow = await web3.eth.getBalance(accounts[1]);

      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");

      const escrow = await Escrow.methods.transactions(escrowId).call();
      assert.equal(escrow.released, true, "Should have been released");
      assert.equal(toBN(escrow.amount).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
    });

    it("Escrow owner can release token funds to the buyer", async () => {
      await StandardToken.methods.approve(Escrow.options.address, value).send({from: accounts[0]});
      receipt = await Escrow.methods.create(accounts[1], value, StandardToken.options.address, expirationTime).send({from: accounts[0]});
      escrowTokenId = receipt.events.Created.returnValues.escrowId;

      const buyerBalanceBeforeEscrow = await StandardToken.methods.balanceOf(accounts[1]).call();
      const contractBalanceBeforeEscrow = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      const escrow = await Escrow.methods.transactions(escrowTokenId).call();

      receipt = await Escrow.methods.release(escrowTokenId).send({from: accounts[0]});
      const buyerBalanceAfterEscrow = await StandardToken.methods.balanceOf(accounts[1]).call();
      const contractBalanceAfterEscrow = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert.equal(toBN(escrow.amount).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
      assert.equal(contractBalanceAfterEscrow, toBN(contractBalanceBeforeEscrow).sub(toBN(value)), "Invalid contract balance");
    });

    it("Released escrow cannot be released again", async() => {
      await Escrow.methods.release(escrowId).send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Released escrow cannot be canceled", async() => {
      await Escrow.methods.release(escrowId).send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("Canceled escrow cannot be released", async() => {
      await expireTransaction();

      await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });
  });

  
  describe("Buyer notifies payment of escrow", async () => {
    beforeEach(async() => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      escrowId = receipt.events.Created.returnValues.escrowId;
    });

    it("A random account should not be able to mark a transaction as paid", async () => {
      try {
        receipt = await Escrow.methods.pay(escrowId).send({from: accounts[7]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    })

    it("A buyer should be able to mark an escrow transaction as paid", async () => {
      receipt = await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      const paid = receipt.events.Paid;
      assert(!!paid, "Paid() not triggered");
      assert.equal(paid.returnValues.escrowId, escrowId, "Invalid escrow id");
    });

    it("Anyone should be able to mark an escrow transaction as paid on behalf of the buyer", async () => {
      // https://medium.com/metamask/the-new-secure-way-to-sign-data-in-your-browser-6af9dd2a1527
      // personal_sign is the recommended way to sign messages. However, ganache does not support it yet.
      // So we're using ethereumjs-utils for this on tests.

      // We use an account with a known privateKey in order to sign the message. 
      // In a browser, just use web3.eth.persona.sign()

      const privateKey = Buffer.from("1122334455667788990011223344556677889900112233445566778899001122", 'hex');
      const publicKey  = EthUtil.privateToPublic(Buffer.from(privateKey, 'hex'));
      const address = '0x' + EthUtil.pubToAddress(publicKey).toString('hex');
      
      receipt = await Escrow.methods.create(address, value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId; 

      const messageToSign = await Escrow.methods.paySignHash(escrowId).call();
      const msgHash = EthUtil.hashPersonalMessage(Buffer.from(EthUtil.stripHexPrefix(messageToSign), 'hex'));
      const signature = EthUtil.ecsign(msgHash, privateKey); 
      const signatureRPC = EthUtil.toRpcSig(signature.v, signature.r, signature.s)

      receipt = await Escrow.methods['pay(uint256,bytes)'](escrowId, signatureRPC).send({from: accounts[9]});

      const paid = receipt.events.Paid;
      assert(!!paid, "Paid() not triggered");
      assert.equal(paid.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    it("A seller cannot cancel paid escrows", async () => {
      receipt = await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      await expireTransaction();

      try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });
  });

  describe("Rating a released Transaction", async() => {
    beforeEach(async() => {
      const isPaused = await Escrow.methods.paused().call();
      if (isPaused) {
        receipt = await Escrow.methods.unpause().send({from: accounts[0]});
      }
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;
      await Escrow.methods.release(escrowId).send({from: accounts[0]});
    });

    it("should not allow a score that's less than 1", async() => {
      try {
        await Escrow.methods.rateTransaction(escrowId, 0).send({from: accounts[1]});
        assert.fail('should have reverted: should not allow a score last less than 1');
      } catch(error) {
        TestUtils.assertJump(error);
        assert.ok(error.message.indexOf('Rating needs to be at least 1') >= 0);
      }
    });

    it("should not allow a score to be more than 5", async() => {
      try {
        await Escrow.methods.rateTransaction(escrowId, 6).send({from: accounts[1]});
        assert.fail('should have reverted: should not allow a score to be more than 5');
      } catch(error) {
        TestUtils.assertJump(error);
        assert.ok(error.message.indexOf('Rating needs to be at less than or equal to 5'))
      }
    });

    for(let i=1; i<=5; i++) {
      it("should allow a score of " + i, async() => {
        await Escrow.methods.rateTransaction(escrowId, i).send({from: accounts[1]});
        const transaction = await Escrow.methods.transactions(escrowId).call();
        assert.equal(transaction.rating, i.toString());
      });
    }

    it("should only allow rating once", async() => {
      await Escrow.methods.rateTransaction(escrowId, 3).send({from: accounts[1]});
      let transaction = await Escrow.methods.transactions(escrowId).call();
      assert.equal(transaction.rating, "3");

      try {
        await Escrow.methods.rateTransaction(escrowId, 2).send({from: accounts[1]});
      } catch(error) {
        TestUtils.assertJump(error);
        assert.ok(error.message.indexOf('Transaction already rated') >= 0);
      }
    });

    it("should only allow the buyer to rate the transaction", async() => {
      try {
        receipt = await Escrow.methods.rateTransaction(escrowId, 4).send({from: accounts[0]});
        assert.fail('should have reverted: should only allow the buyer to rate the transaction');
      } catch(error) {
        TestUtils.assertJump(error);
        assert.ok(error.message.indexOf('Function can only be invoked by the escrow buyer') >= 0);
      }
    });
  });


  describe("Rating an unreleased Transaction", async() => {
    beforeEach(async() => {
      const isPaused = await Escrow.methods.paused().call();
      if (isPaused) {
        receipt = await Escrow.methods.unpause().send({from: accounts[0]});
      }
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;
    });

    it("should not allow rating an unreleased transaction", async() => {
      try {
        await Escrow.methods.rateTransaction(escrowId, 4).send({from: accounts[0]});
        assert.fail('should have reverted: should not allow a score last less than 1');
      } catch(error) {
        TestUtils.assertJump(error);
        assert.ok(error.message.indexOf('Transaction not released yet') >= 0);
      }
    });
  });

  describe("Getting a user rating", async() => {
    let receipt, created, escrowId, seller;

    beforeEach(async() => {
      seller = accounts[0];
      for (let i = 1; i <= 5; i++) {
        let buyer = accounts[i];
        let rating = i;
        const isPaused = await Escrow.methods.paused().call();
        if (isPaused) {
          receipt = await Escrow.methods.unpause().send({from: seller});
        }
        receipt = await Escrow.methods.create(buyer, value, TestUtils.zeroAddress, expirationTime).send({from: seller, value});
        created = receipt.events.Created;
        escrowId = created.returnValues.escrowId;
        await Escrow.methods.release(escrowId).send({from: seller});
        await Escrow.methods.rateTransaction(escrowId, i).send({from: buyer});
      }
    });

    it("should calculate the user rating", async() => {
      const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
      const events = await Escrow.getPastEvents('Rating', {fromBlock: 1, filter: {seller}})

      let ratings = events.slice(events.length - 5).map((e) => parseInt(e.returnValues.rating, 10))
      assert.equal(arrAvg(ratings), 3, "The seller rating is not correct")
    })
  });


  describe("Transaction arbitration case", async() => {
    beforeEach(async() => {
      receipt = await Escrow.methods.create(accounts[1], value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;
    });

    it("should allow a buyer to open a case", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      receipt = await Escrow.methods.openCase(escrowId).send({from: accounts[1]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    it("random account cannot open a case for an existing escrow", async() => {
      try {
        await Escrow.methods.openCase(escrowId).send({from: accounts[3]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("should allow anyone to open an arbitration case on behalf of a buyer", async() => {
      // https://medium.com/metamask/the-new-secure-way-to-sign-data-in-your-browser-6af9dd2a1527
      // personal_sign is the recommended way to sign messages. However, ganache does not support it yet.
      // So we're using ethereumjs-utils for this on tests.

      // We use an account with a known privateKey in order to sign the message. 
      // In a browser, just use web3.eth.persona.sign()

      const privateKey = Buffer.from("1122334455667788990011223344556677889900112233445566778899001122", 'hex');
      const publicKey  = EthUtil.privateToPublic(Buffer.from(privateKey, 'hex'));
      const address = '0x' + EthUtil.pubToAddress(publicKey).toString('hex');
      receipt = await Escrow.methods.create(address, value, TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId; 

      let messageToSign, msgHash, signature, signatureRPC;

      messageToSign = await Escrow.methods.paySignHash(escrowId).call();
      msgHash = EthUtil.hashPersonalMessage(Buffer.from(EthUtil.stripHexPrefix(messageToSign), 'hex'));
      signature = EthUtil.ecsign(msgHash, privateKey); 
      signatureRPC = EthUtil.toRpcSig(signature.v, signature.r, signature.s)

      receipt = await Escrow.methods['pay(uint256,bytes)'](escrowId, signatureRPC).send({from: accounts[8]});

      messageToSign = await Escrow.methods.openCaseSignHash(escrowId).call();
      msgHash = EthUtil.hashPersonalMessage(Buffer.from(EthUtil.stripHexPrefix(messageToSign), 'hex'));
      signature = EthUtil.ecsign(msgHash, privateKey); 
      signatureRPC = EthUtil.toRpcSig(signature.v, signature.r, signature.s);

      receipt = await Escrow.methods['openCase(uint256,bytes)'](escrowId, signatureRPC).send({from: accounts[9]});
      const arbitrationRequired = receipt.events.ArbitrationRequired;
      assert(!!arbitrationRequired, "ArbitrationRequired() not triggered");
      assert.equal(arbitrationRequired.returnValues.escrowId, escrowId, "Invalid escrowId");
    });

    const ARBITRATION_SOLVED_BUYER = 1; 
    const ARBITRATION_SOLVED_SELLER = 2;

    it("non arbitrers cannot resolve a case", async() => {
      try {
        receipt = await Escrow.methods.setArbitrageResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: accounts[1]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }    
    });

    it("should transfer to buyer if case is solved in their favor", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId).send({from: accounts[1]});

      receipt = await Escrow.methods.setArbitrageResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrer});
      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");
    });

    it("should cancel escrow if case is solved in favor of the seller", async() => {
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});
      await Escrow.methods.openCase(escrowId).send({from: accounts[1]});

      receipt = await Escrow.methods.setArbitrageResult(escrowId, ARBITRATION_SOLVED_SELLER).send({from: arbitrer});
      const released = receipt.events.Canceled;
      assert(!!released, "Canceled() not triggered");
    });

  });

  describe("Other operations", async () => {
    it("Paused contract allows withdrawal by owner only on active escrows", async () => {
      receipt = await Escrow.methods.create(accounts[1], "1", TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value: "1"});

      const releasedEscrowId = receipt.events.Created.returnValues.escrowId;

      await Escrow.methods.release(releasedEscrowId).send({from: accounts[0]});

      receipt = await Escrow.methods.create(accounts[1], "1", TestUtils.zeroAddress, expirationTime).send({from: accounts[0], value: "1"});
      escrowId = receipt.events.Created.returnValues.escrowId;

      await StandardToken.methods.mint(accounts[0], value).send();

      const balanceBeforeCreation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceBeforeCancelation = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      await StandardToken.methods.approve(Escrow.options.address, value).send({from: accounts[0]});
      
      receipt = await Escrow.methods.create(accounts[1], value, StandardToken.options.address, expirationTime).send({from: accounts[0]});
      escrowTokenId = receipt.events.Created.returnValues.escrowId;

      try {
        receipt = await Escrow.methods.withdraw_emergency(escrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }

      receipt = await Escrow.methods.pause().send({from: accounts[0]});

      const paused = receipt.events.Paused;

      assert(!!paused, "Paused() not triggered");

      try {
        receipt = await Escrow.methods.withdraw_emergency(releasedEscrowId).send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }

      await Escrow.methods.withdraw_emergency(escrowId).send({from: accounts[0]});

      let escrow = await Escrow.methods.transactions(escrowId).call();

      assert.equal(escrow.canceled, true, "Should be canceled");

      await Escrow.methods.withdraw_emergency(escrowTokenId).send({from: accounts[0]});

      const balanceAfterCancelation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceAfterCancelation = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert.equal(contractBalanceAfterCancelation, contractBalanceBeforeCancelation, "Invalid contract balance");
      assert.equal(balanceBeforeCreation, balanceAfterCancelation, "Invalid seller balance");
    });

    it("arbitrator should be valid", async () => {
      const isArbitrer = await Escrow.methods.isArbitrer(arbitrer).call();
      assert.equal(isArbitrer, true, "Invalid arbitrer");

      const nonArbitrer = await Escrow.methods.isArbitrer(accounts[9]).call();
      assert.equal(nonArbitrer, false, "Account should not be an arbitrator");
    });

    it("non-owner should not be able to change the arbitrator", async () => {
      try {
        receipt = await await Escrow.methods.setArbitrer(accounts[7]).send({from: accounts[9]});
        assert.fail('should have reverted before');
      } catch (error) {
        TestUtils.assertJump(error);
      }
    });

    it("owner should be able to change the arbitrator", async() => {
      const newArbitrator = "0x1122334455667788990011223344556677889900";
      
      receipt = await Escrow.methods.setArbitrer(newArbitrator).send({from: accounts[0]});

      const arbitrerChanged = receipt.events.ArbitrerChanged;
      assert(!!arbitrerChanged, "ArbitrerChanged() not triggered");
      assert.equal(arbitrerChanged.returnValues.arbitrer, newArbitrator, "Invalid Arbitrator");

      const isArbitrer = await Escrow.methods.isArbitrer(newArbitrator).call();
      assert.equal(isArbitrer, true, "New arbitrator not set correctly");
    });
  });

});
