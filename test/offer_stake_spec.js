/*global contract, config, it, assert, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");

const ArbitrationLicense = require('Embark/contracts/ArbitrationLicense');
const MetadataStore = require('Embark/contracts/MetadataStore');
const Escrow = require('Embark/contracts/Escrow');
const SNT = require('Embark/contracts/SNT');

const ARBITRATION_SOLVED_BUYER = 1;
const ARBITRATION_SOLVED_SELLER = 2;

let accounts;
let arbitrator, blacklistedAccount;

const feePercent = 1;
const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

config({
  blockchain: {
    accounts: [
      {
        mnemonic: "foster gesture flock merge beach plate dish view friend leave drink valley shield list enemy",
        balance: "5 ether",
        numAddresses: "10"
      }
    ]
  },
  contracts: {
    deploy: {
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
        args: ["$accounts[0]", "0x0000000000000000000000000000000000000000", "$ArbitrationLicense", "$MetadataStore", BURN_ADDRESS, feePercent * 1000],
        onDeploy: ["MetadataStore.methods.setAllowedContract('$Escrow', true).send()"]
      },
      StandardToken: {
      }
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[8];
  blacklistedAccount = accounts[5];
});

contract("Escrow", function() {

  const tradeAmount = 100;
  const feeAmount = Math.round(tradeAmount * (feePercent / 100));

  let receipt, escrowId, ethOfferId, hash, signature, nonce;
  let created;
  let offerIds = [];

  this.timeout(0);

  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    await SNT.methods.generateTokens(blacklistedAccount, 1000).send();

    // Register arbitrators
    await SNT.methods.generateTokens(arbitrator, 1000).send();

    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});
    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: arbitrator});
    await ArbitrationLicense.methods.blacklistSeller(blacklistedAccount).send({from: arbitrator});
  });

  describe("Offer Stake", async() => {

    it("price for each offers should increase exponentially (0.01, 0.04, 0.09, 0.16,...)", async() => {
      let amountToStake;

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.01", "ether"));

      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      offerIds.push(receipt.events.OfferAdded.returnValues.offerId);

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.04", "ether"));

      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      offerIds.push(receipt.events.OfferAdded.returnValues.offerId);

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.09", "ether"));

      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      offerIds.push(receipt.events.OfferAdded.returnValues.offerId);

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.16", "ether"));

      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      offerIds.push(receipt.events.OfferAdded.returnValues.offerId);
    });

    it("price should decrease for each offer exponentially (1600, 900, 400, 100)", async() => {
      let currOffer, amountToStake;

      currOffer = offerIds.pop();
      await MetadataStore.methods.removeOffer(currOffer).send();
      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.16", "ether"));

      currOffer = offerIds.pop();
      await MetadataStore.methods.removeOffer(currOffer).send();
      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.09", "ether"));

      currOffer = offerIds.pop();
      await MetadataStore.methods.removeOffer(currOffer).send();
      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.04", "ether"));

      currOffer = offerIds.pop();
      await MetadataStore.methods.removeOffer(currOffer).send();
      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.01", "ether"));

    });

    it("price for each offers should keep increasing exponentially (0.04)", async() => {
      let amountToStake;

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

      amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.04", "ether"));
    });


    it("deleting an offer should refund the stake", async() => {
      let contractBalance, userBalance1, userBalance2;

      userBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0.01", "ether"));

      receipt = await MetadataStore.methods.removeOffer(ethOfferId).send();
      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0", "ether"));

      userBalance2 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

      assert(userBalance1.lt(userBalance2), "User balance did not increase after refund");
    });

    it("releasing an escrow should refund the stake and decrease next offer price", async() => {
      let contractBalance, userBalance1, userBalance2;

      // Create Offer
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

      userBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0.01", "ether"));

      // Create Escrow
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, CONTACT_DATA, "L", "U").send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund Escrow
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});

      // Release Escrow
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});

      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0", "ether"));

      userBalance2 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
      assert(userBalance1.lt(userBalance2), "User balance did not increase after refund");

      const stakeDetails = await MetadataStore.methods.stakes(ethOfferId).call();
      assert.strictEqual(stakeDetails.amount, "0");
    });

    it("price for next offer should decrease", async() => {
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.01", "ether"));
    });

    it("losing a dispute should slash the stake and send it to the burn address", async() => {
      let contractBalance, burnAddressBalance1, burnAddressBalance2;

      // Create Offer
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      burnAddressBalance1 = await web3.eth.getBalance(BURN_ADDRESS);
      assert.strictEqual(contractBalance, web3.utils.toWei("0.01", "ether"));

      // Create Escrow
      hash = await MetadataStore.methods.getDataHash("U", CONTACT_DATA).call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, CONTACT_DATA, "L", "U", nonce, signature).send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund Escrow
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});

      // Pay Escrow
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      // Open dispute
      await Escrow.methods.openCase(escrowId, '1').send({from: accounts[1]});

      // Seller loses dispute
      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrator});

      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0", "ether"));

      burnAddressBalance2 = await web3.eth.getBalance(BURN_ADDRESS);
      assert.strictEqual(burnAddressBalance2, web3.utils.toBN(burnAddressBalance1).add(web3.utils.toBN(web3.utils.toWei("0.01", "ether"))).toString());

      const stakeDetails = await MetadataStore.methods.stakes(ethOfferId).call();
      assert.strictEqual(stakeDetails.amount, "0");
    });

    it("price for next offer should not change after losing the dispute", async() => {
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      assert.strictEqual(amountToStake, web3.utils.toWei("0.04", "ether"));
    });

    it("losing a dispute twice shoud not fail", async() => {
      // Create Escrow
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, CONTACT_DATA, "L", "U").send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund Escrow
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});

      // Pay Escrow
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      // Open dispute
      await Escrow.methods.openCase(escrowId, '1').send({from: accounts[1]});

      // Seller loses dispute
      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_BUYER).send({from: arbitrator});
    });

    it("winning a dispute should not release the stake (only succesful trades do)", async() => {
      let contractBalance;

      // Create Offer
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      receipt = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, arbitrator).send({from: accounts[0], value: amountToStake});
      ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0.04", "ether"));

      // Create Escrow
      hash = await MetadataStore.methods.getDataHash("U", CONTACT_DATA).call({from: accounts[1]});
      signature = await web3.eth.sign(hash, accounts[1]);
      nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      receipt = await Escrow.methods.createEscrow(ethOfferId, tradeAmount, 140, CONTACT_DATA, "L", "U", nonce, signature).send({from: accounts[1]});
      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund Escrow
      receipt = await Escrow.methods.fund(escrowId).send({from: accounts[0], value: tradeAmount + feeAmount});

      // Pay Escrow
      await Escrow.methods.pay(escrowId).send({from: accounts[1]});

      // Open dispute
      await Escrow.methods.openCase(escrowId, '1').send({from: accounts[1]});

      // Seller wins dispute
      receipt = await Escrow.methods.setArbitrationResult(escrowId, ARBITRATION_SOLVED_SELLER).send({from: arbitrator});

      contractBalance = await web3.eth.getBalance(MetadataStore.options.address);
      assert.strictEqual(contractBalance, web3.utils.toWei("0.04", "ether"));
    });
  });

});
