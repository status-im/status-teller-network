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

  describe("Creating a new escrow", async () => {

it("Buyer can create escrow", async () => {
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await Escrow.methods.create(ethOfferId, 123, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");
      assert.equal(created.returnValues.offerId, ethOfferId, "Invalid offerId");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    });

    it("Seller should be able to create escrows", async () => {
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await Escrow.methods.create(ethOfferId, 123, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[0]});

      const created = receipt.events.Created;
      assert(!!created, "Created() not triggered");

      assert.equal(created.returnValues.offerId, ethOfferId, "Invalid offerId");
      assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
      escrowId = created.returnValues.escrowId;
    });

    it("Created escrow should contain valid data", async () => {
      assert.equal(await Escrow.methods.offerId().call(), ethOfferId, "Invalid offerId");
      assert.equal(await Escrow.methods.buyer().call(), accounts[1], "Invalid buyer");
      assert.equal(await Escrow.methods.tradeAmount().call(), 123, "Invalid trade amount");
      assert.equal(await Escrow.methods.tradeType().call(), FIAT, "Invalid trade trade type");
      assert.equal(await Escrow.methods.status().call(), ESCROW_CREATED, "Invalid status");
    });

    it("Seller should be able to fund escrow", async () => {
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await Escrow.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[0]});
      escrowId = receipt.events.Created.returnValues.escrowId;

      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});
      const funded = receipt.events.Funded;
      assert(!!funded, "Funded() not triggered");
    });

    it("Funded escrow should contain valid data", async () => {
      const ethFeeBalance = await Escrow.methods.feeTokenBalances(TestUtils.zeroAddress).call();
      assert.strictEqual(parseInt(ethFeeBalance, 10), feeAmount, 'Invalid fee balance');
      const contractBalance = await web3.eth.getBalance(Escrow.options.address);
      assert.equal(contractBalance, feeAmount + tradeAmount, "Invalid contract balance");
      assert.equal(await Escrow.methods.tradeAmount().call(), tradeAmount, "Invalid amount");
      assert.equal(await Escrow.methods.expirationTime().call(), expirationTime, "Invalid expirationTime");
      assert.equal(await Escrow.methods.status().call(), ESCROW_FUNDED, "Invalid status");
    });

    it("Escrows can be created with ERC20 tokens", async () => {
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await EscrowManagement.methods.create(tokenOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;

      await StandardToken.methods.mint(accounts[0], tradeAmount + feeAmount).send();

      const balanceBeforeCreation = await StandardToken.methods.balanceOf(accounts[0]).call();

      await StandardToken.methods.approve(Escrow.options.address, tradeAmount + feeAmount).send({from: accounts[0]});  

      const allowance = await StandardToken.methods.allowance(accounts[0], Escrow.options.address).call();
      assert(allowance >= tradeAmount + feeAmount, "Allowance needs to be equal or higher to the amount plus the fee");

      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0]});
      const funded = receipt.events.Funded;
      assert(!!funded, "Funded() not triggered");

      const balanceAfterCreation = await StandardToken.methods.balanceOf(accounts[0]).call();

      assert(toBN(balanceAfterCreation), toBN(balanceBeforeCreation).sub(toBN(tradeAmount)), "Token value wasn't deducted");

      const contractBalance = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert(toBN(contractBalance), toBN(tradeAmount), "Contract token balance is incorrect");

      assert.equal(await Escrow.methods.tradeAmount().call(), tradeAmount, "Invalid amount");
    });
  });


  describe("Canceling an escrow", async () => {
    let created;

    it("A seller cannot cancel an unexpired funded escrow", async () => {     
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Can only be canceled after expiration");
      }
    });

    it("A seller can cancel their ETH escrows", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      await expireTransaction();

      receipt = await Escrow.methods.cancel().send({from: accounts[0]});

      let Canceled = receipt.events.Canceled;
      assert(!!Canceled, "Canceled() not triggered");

      let status = await Escrow.methods.status().call();
      assert.equal(status, ESCROW_CANCELED, "Should have been canceled");
    });

    it("A seller can cancel their token escrows", async () => {
      await StandardToken.methods.mint(accounts[0], tradeAmount + feeAmount).send();

      const balanceBeforeCreation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceBeforeCreation = await StandardToken.methods.balanceOf(Escrow.options.address).call();
      
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(tokenOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      await StandardToken.methods.approve(Escrow.options.address, tradeAmount + feeAmount).send({from: accounts[0]});
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0]});

      await expireTransaction();

      await Escrow.methods.cancel().send({from: accounts[0]});

      const balanceAfterCancelation = await StandardToken.methods.balanceOf(accounts[0]).call();
      const contractBalanceAfterCancelation = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert.equal(await Escrow.methods.status().call(), ESCROW_CANCELED, "Should have been canceled");
      assert.equal(balanceBeforeCreation, balanceAfterCancelation, "Invalid seller balance");
      assert.equal(contractBalanceBeforeCreation, contractBalanceAfterCancelation, "Invalid contract balance");
    });

    it("A buyer can cancel an escrow that hasn't been funded yet", async () => {
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;

      receipt = await Escrow.methods.cancel().send({from: accounts[1]});
      let Canceled = receipt.events.Canceled;
      assert(!!Canceled, "Canceled() not triggered");
    });

    it("A buyer can cancel an escrow that has been funded", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      receipt = await Escrow.methods.cancel().send({from: accounts[1]});

      let Canceled = receipt.events.Canceled;
      assert(!!Canceled, "Canceled() not triggered");
    });

    it("An escrow can only be canceled once", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      await expireTransaction();
      receipt = await Escrow.methods.cancel().send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only transactions in created or funded state can be canceled");
      }
    });

    it("Accounts different from the escrow participants cannot cancel escrows", async() => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[2]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only participants can invoke this function");
      }
    });

    it("A seller cannot cancel an escrow marked as paid", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      receipt = await Escrow.methods.pay().send({from: accounts[1]});

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only transactions in created or funded state can be canceled");
      }
    });
  });


  describe("Releasing escrows", async () => {
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

    it("Accounts different from the seller cannot release an escrow", async () => {
      try {
        await Escrow.methods.release().send({from: accounts[1]}); // Buyer tries to release
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only the seller can invoke this function");
      }
    });

    it("Escrow owner can release his funds to the buyer", async () => {
      const buyerBalanceBeforeEscrow = await web3.eth.getBalance(accounts[1]);
      receipt = await Escrow.methods.release().send({from: accounts[0]});
      const buyerBalanceAfterEscrow = await web3.eth.getBalance(accounts[1]);

      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");

      assert.equal(await Escrow.methods.status().call(), ESCROW_RELEASED, "Should have been released");
      assert.equal(toBN(await Escrow.methods.tokenAmount().call()).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
    });

    it("Escrow owner can release token funds to the buyer", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(tokenOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      await StandardToken.methods.approve(Escrow.options.address, tradeAmount + feeAmount).send({from: accounts[0]});
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0]});

      const buyerBalanceBeforeEscrow = await StandardToken.methods.balanceOf(accounts[1]).call();
      const contractBalanceBeforeEscrow = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      receipt = await Escrow.methods.release().send({from: accounts[0]});
      const buyerBalanceAfterEscrow = await StandardToken.methods.balanceOf(accounts[1]).call();
      const contractBalanceAfterEscrow = await StandardToken.methods.balanceOf(Escrow.options.address).call();

      assert.equal(toBN(await Escrow.methods.tokenAmount().call()).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
      assert.equal(contractBalanceAfterEscrow, toBN(contractBalanceBeforeEscrow).sub(toBN(tradeAmount)), "Invalid contract balance");
    });

    it("Released escrow cannot be released again", async() => {
      await Escrow.methods.release().send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.release().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Invalid transaction status");
      }
    });

    it("Released escrow cannot be canceled", async() => {
      await Escrow.methods.release().send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only transactions in created or funded state can be canceled");
      }
    });

    it("Canceled escrow cannot be released", async() => {
      await expireTransaction();

      await Escrow.methods.cancel().send({from: accounts[0]});

      try {
        receipt = await Escrow.methods.release().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Invalid transaction status");
      }
    });
  });


  describe("Buyer notifies payment of escrow", async () => {
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

    it("A random account should not be able to mark a transaction as paid", async () => {
      try {
        receipt = await Escrow.methods.pay().send({from: accounts[7]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only participants can invoke this function");
      }
    });

    it("A buyer should be able to mark an escrow transaction as paid", async () => {
      receipt = await Escrow.methods.pay().send({from: accounts[1]});
      const paid = receipt.events.Paid;
      assert(!!paid, "Paid() not triggered");
      assert.equal(paid.returnValues.escrowId, escrowId, "Invalid escrow id");
    });

    it("Anyone should be able to mark an escrow transaction as paid on behalf of the buyer", async () => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      const messageToSign = await Escrow.methods.paySignHash().call();
      signature = await web3.eth.sign(messageToSign, accounts[1]);

      receipt = await Escrow.methods['pay(bytes)'](signature).send({from: accounts[9]});

      const paid = receipt.events.Paid;
      assert(!!paid, "Paid() not triggered");
    });

    it("A seller cannot cancel paid escrows", async () => {
      receipt = await Escrow.methods.pay().send({from: accounts[1]});

      await expireTransaction();

      try {
        receipt = await Escrow.methods.cancel().send({from: accounts[0]});
        assert.fail('should have reverted before');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Only transactions in created or funded state can be canceled");
      }
    });
  });

  describe("Rating a released Transaction", async() => {
    beforeEach(async() => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      await Escrow.methods.release().send({from: accounts[0]});

      Escrow.options.jsonInterface.push(EscrowManagement.options.jsonInterface.find(x => x.name == 'Rating'));

    });

    it("should not allow a score that's less than 1", async() => {
      try {
        await Escrow.methods.rateTransaction(0).send({from: accounts[1]});
        assert.fail('should have reverted: should not allow a score last less than 1');
      } catch(error) {
        TestUtils.assertJump(error);
      }
    });

    it("should not allow a score to be more than 5", async() => {
      try {
        await Escrow.methods.rateTransaction(6).send({from: accounts[1]});
        assert.fail('should have reverted: should not allow a score to be more than 5');
      } catch(error) {
        TestUtils.assertJump(error);
      }
    });
    
    for(let i=1; i<=5; i++) {
      it("should allow a score of " + i, async() => {
        receipt = await Escrow.methods.rateTransaction(i).send({from: accounts[1]});
        assert.equal(await EscrowManagement.methods.rating(Escrow.options.address).call(), i.toString());
      });
    }

    it("should only allow rating once", async() => {
      await Escrow.methods.rateTransaction(3).send({from: accounts[1]});
      assert.equal(await EscrowManagement.methods.rating(Escrow.options.address).call(), "3");

      try {
        await Escrow.methods.rateTransaction(2).send({from: accounts[1]});
      } catch(error) {
        TestUtils.assertJump(error);
      }
    });

    it("should only allow the buyer to rate the transaction", async() => {
      try {
        receipt = await Escrow.methods.rateTransaction(4).send({from: accounts[0]});
        assert.fail('should have reverted: should only allow the buyer to rate the transaction');
      } catch(error) {
        TestUtils.assertJump(error);
      }
    });
  });


  describe("Rating an unreleased Transaction", async() => {
    let receipt, created, escrowId;

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

    it("should not allow rating an unreleased transaction", async() => {
      try {
        await Escrow.methods.rateTransaction(4).send({from: accounts[0]});
        assert.fail('should have reverted: should not allow a score last less than 1');
      } catch(error) {
        TestUtils.assertJump(error);
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
        
        // Create
        hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: buyer});
        signature = await web3.eth.sign(hash, buyer);
        nonce = await MetadataStore.methods.user_nonce(buyer).call();
        receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: seller});
        Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
        // Fund
        receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

        await Escrow.methods.release().send({from: seller});
        await Escrow.methods.rateTransaction(rating).send({from: buyer});
      }
    });

    it("should calculate the user rating", async() => {
      const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
      const events = await EscrowManagement.getPastEvents('Rating', {fromBlock: 1, filter: {seller}});

      let ratings = events.slice(events.length - 5).map((e) => parseInt(e.returnValues.rating, 10));
      assert.equal(arrAvg(ratings), 3, "The seller rating is not correct");
    });
  });

  describe("Escrow fees", async() => {
    it("fee balance should increase with escrow funding", async() => {
      // Create
      hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await EscrowManagement.methods.create(ethOfferId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: accounts[1]});
      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;

      const ethFeeBalanceBefore = await Escrow.methods.feeTokenBalances(TestUtils.zeroAddress).call();
      const totalEthBefore = await web3.eth.getBalance(Escrow.options.address);

      // Fund
      receipt = await Escrow.methods.fund(tradeAmount, expirationTime).send({from: accounts[0], value: tradeAmount + feeAmount});

      const ethFeeBalance = await Escrow.methods.feeTokenBalances(TestUtils.zeroAddress).call();
      const totalEthAfter = await web3.eth.getBalance(Escrow.options.address);

      assert.strictEqual(parseInt(ethFeeBalance, 10), parseInt(ethFeeBalanceBefore, 10) + feeAmount, "Fee balance did not increase");
      assert.strictEqual(parseInt(totalEthAfter, 10), parseInt(totalEthBefore, 10) + feeAmount + tradeAmount, "Total balance did not increase");
    });

    it("fees can be withdrawn to burn address", async() => {
      const ethFeeBalanceBefore = await Escrow.methods.feeTokenBalances(TestUtils.zeroAddress).call();
      const totalEthBefore = await web3.eth.getBalance(Escrow.options.address);
      const destAddressBalanceBefore = await web3.eth.getBalance(await Escrow.methods.feeDestination().call());

      receipt = await Escrow.methods.withdrawFees(TestUtils.zeroAddress).send({from: accounts[0]});

      const ethFeeBalanceAfter = await Escrow.methods.feeTokenBalances(TestUtils.zeroAddress).call();
      const totalEthAfter = await web3.eth.getBalance(Escrow.options.address);
      const destAddressBalanceAfter = await web3.eth.getBalance(await Escrow.methods.feeDestination().call());

      assert.strictEqual(toBN(totalEthAfter).toString(), (toBN(totalEthBefore).sub(toBN(ethFeeBalanceBefore)).toString()), "Invalid contract balance");
      assert.strictEqual(parseInt(ethFeeBalanceAfter, 10), 0, "Invalid fee balance");
      assert.strictEqual(toBN(destAddressBalanceAfter).toString(), (toBN(destAddressBalanceBefore).add(toBN(ethFeeBalanceBefore)).toString()), "Invalid address balance");
    });
  });

});
