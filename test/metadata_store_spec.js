/*global contract, config, it, assert, before, web3*/

const ArbitrationLicense = require('Embark/contracts/ArbitrationLicense');

const SNT = require('Embark/contracts/SNT');
const MetadataStore = require('Embark/contracts/MetadataStore');

const BURN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

let accounts;

config({
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
      SellerLicense: {
        instanceOf: "License",
        args: ["$SNT", 10, BURN_ADDRESS]
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

      MetadataStore: {
        args: ["$SellerLicense", "$ArbitrationLicense", BURN_ADDRESS]
      }
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

let hash, signature;

contract("MetadataStore", function () {
  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
    await SNT.methods.generateTokens(accounts[9], 1000).send();

    const encodedCall = ArbitrationLicense.methods.buy().encodeABI();

    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall).send({from: accounts[9]});

    await ArbitrationLicense.methods.changeAcceptAny(true).send({from: accounts[9]});

    hash = await MetadataStore.methods.getDataHash("Iuri", CONTACT_DATA).call();
    signature = await web3.eth.sign(hash, accounts[0]);
  });

  it("should allow to add new user and offer", async function () {
    const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
    await MetadataStore.methods.addOffer(SNT.address, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 1, accounts[9]).send({value: amountToStake});

    const offersSize = await MetadataStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '1');

    const userInfo = await MetadataStore.methods.users(accounts[0]).call();
    assert.strictEqual(userInfo.username, "Iuri");
  });

  it("should allow to add new offer only when already a user", async function () {
    const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
    await MetadataStore.methods.addOffer(SNT.address, CONTACT_DATA, "London", "EUR", "Iuri", [0], 0, 0, 1, accounts[9]).send({value: amountToStake});
    const offersSize = await MetadataStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '2');

    const offerIds = await MetadataStore.methods.getOfferIds(accounts[0]).call();
    assert.strictEqual(offerIds.length, 2);
  });

  it("should allow to add new offer when margin is more than 100", async function () {
      const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
      await MetadataStore.methods.addOffer(SNT.address, CONTACT_DATA, "London", "USD", "Iuri", [0], 0, 0, 101, accounts[9]).send({value: amountToStake});

      const offerIds = await MetadataStore.methods.getOfferIds(accounts[0]).call();
      assert.strictEqual(offerIds.length, 3);
  });

  it("should allow to update a user", async function () {
    await MetadataStore.methods.addOrUpdateUser(CONTACT_DATA, "Montreal", "Anthony").send();
    const user = await MetadataStore.methods.users(accounts[0]).call();
    assert.strictEqual(user.location, 'Montreal');
    assert.strictEqual(user.username, 'Anthony');
  });

  it("should allow to update a user using a signature", async function () {
    hash = await MetadataStore.methods.getDataHash("Anthony", CONTACT_DATA).call();
    signature = await web3.eth.sign(hash, accounts[0]);
    let nonce = await MetadataStore.methods.user_nonce(accounts[0]).call();

    await MetadataStore.methods.addOrUpdateUser(signature, CONTACT_DATA, "Quebec", "Anthony", nonce).send();
    const user = await MetadataStore.methods.users(accounts[0]).call();
    assert.strictEqual(user.location, 'Quebec');
  });

  it("should allow to delete an offer", async function () {
    const amountToStake = await MetadataStore.methods.getAmountToStake(accounts[0]).call();
    const receipt = await MetadataStore.methods.addOffer(SNT.address, CONTACT_DATA, "London", "EUR", "Iuri", [0], 0, 0, 1, accounts[9]).send({value: amountToStake});
    const offerAdded = receipt.events.OfferAdded;
    const offerId = offerAdded.returnValues.offerId;

    const receipt2 = await MetadataStore.methods.removeOffer(offerId).send();
    const offerRemoved = receipt2.events.OfferRemoved;
    assert(!!offerRemoved, "OfferRemoved() not triggered");
    assert.strictEqual(offerRemoved.returnValues.owner, accounts[0], "Invalid seller");
    assert.strictEqual(offerRemoved.returnValues.offerId, offerId, "Invalid offer");
  });
});
