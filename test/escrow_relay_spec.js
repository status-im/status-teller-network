/*global contract, config, it, assert, embark, web3, before, describe, beforeEach*/

const TestUtils = require("../utils/testUtils");

const EscrowFactory = require('Embark/contracts/EscrowFactory');

let accounts;


const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const Arbitrations = embark.require('Embark/contracts/Arbitrations');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const Escrow = embark.require('Embark/contracts/Escrow');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const SNT = embark.require('Embark/contracts/SNT');
const FIAT = 0;

let arbitrator, seller, buyer, receipt, offerId;

const FEE_MILLI_PERCENT = "1000"; // 1 percent

const feePercent = 1;
const tradeAmount = 100;
const feeAmount = Math.round(tradeAmount * (feePercent / 100));

let expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;

const ESCROW_FUNDED = 1;
const ESCROW_PAID = 2;

config({
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
    "EscrowFactory": {},
    "EscrowRelay": {
      "args": ["$EscrowFactory", "$MetadataStore"]
    },
    Escrow: {
      args: ["$EscrowRelay", "$SellerLicense", "$Arbitrations", "$MetadataStore", "0x0000000000000000000000000000000000000002", feePercent * FEE_MILLI_PERCENT]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  arbitrator = accounts[9];
  seller = accounts[0];
  buyer = accounts[1];
});

contract("Escrow Relay", function () {

  before(async () => {
    // Register Seller
    await SNT.methods.generateTokens(seller, 1000).send();
    const encodedCall = SellerLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(SellerLicense.options.address, 10, encodedCall).send({from: seller});

    // Register Arbitrator
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});

    // Creating Offer
    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: seller});
    offerId = receipt.events.OfferAdded.returnValues.offerId;
  });
  
  it("Should set a template", async () => {
    const abiEncode = Escrow.methods.init(
      EscrowRelay.options.address,
      SellerLicense.options.address,
      Arbitrations.options.address,
      MetadataStore.options.address,
      "0x0000000000000000000000000000000000000002",
      FEE_MILLI_PERCENT
    ).encodeABI();

    
    await EscrowFactory.methods.setTemplate(Escrow.options.address, abiEncode).send();
  });

  it("Instantiate an escrow", async () => {
    const hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: buyer});
    const signature = await web3.eth.sign(hash, buyer);
    const nonce = await MetadataStore.methods.user_nonce(buyer).call();

    receipt = await EscrowFactory.methods.create(offerId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: buyer});
    Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
  });

  it("Should be able to fund escrow", async () => {
    await SNT.methods.approve(Escrow.options.address, tradeAmount + feeAmount).send({from: seller});
    await Escrow.methods.fund(tradeAmount, expirationTime).send({from: seller, value: tradeAmount + feeAmount});
    const status = await Escrow.methods.status().call();
    assert.equal(status, ESCROW_FUNDED, "Invalid status");
  });

  it("Random account should not be able to pay escrow", async () => {
    try {
      await EscrowRelay.methods.pay(Escrow.options.address).send({from: accounts[2]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });

  it("Should be able to pay escrow", async () => {
    await EscrowRelay.methods.pay(Escrow.options.address).send({from: buyer});
    const status = await Escrow.methods.status().call();
    assert.equal(status, ESCROW_PAID, "Invalid status");
  });

  it("Instantiate an escrow via relay", async () => {
    const hash = await MetadataStore.methods.getDataHash("U", "0x00").call({from: buyer});
    const signature = await web3.eth.sign(hash, buyer);
    const nonce = await MetadataStore.methods.user_nonce(buyer).call();

    EscrowRelay.options.jsonInterface.push(EscrowFactory.options.jsonInterface.find(x => x.name === "InstanceCreated"));

    receipt = await EscrowRelay.methods.create(offerId, tradeAmount, FIAT, 140, "0x00", "L", "U", nonce, signature).send({from: buyer});
    
    Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;

    await SNT.methods.approve(Escrow.options.address, tradeAmount + feeAmount).send({from: seller});
    await Escrow.methods.fund(tradeAmount, expirationTime).send({from: seller, value: tradeAmount + feeAmount});

    const status = await Escrow.methods.status().call();
    assert.equal(status, ESCROW_FUNDED, "Invalid status");
  });


});