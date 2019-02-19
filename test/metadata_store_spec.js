/*global contract, config, it, assert, before*/

const TestUtils = require("../utils/testUtils");

const License = require('Embark/contracts/License');
const SNT = require('Embark/contracts/SNT');
const MetadataStore = require('Embark/contracts/MetadataStore');

let accounts;


config({
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
    MetadataStore: {
      args: ["$License"]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("MetadataStore", function () {
  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
  });

  it("should not allow to add new user when not license owner", async function () {
    try {
      await MetadataStore.methods.addOffer(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 1).send();
    } catch(error) {
      const usersSize = await MetadataStore.methods.usersSize().call();
      assert.strictEqual(usersSize, '0');
    }
  });

  it("should allow to add new user and offer when license owner", async function () {
    const encodedCall = License.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(License.options.address, 10, encodedCall).send();
    await MetadataStore.methods.addOffer(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 1).send();
    const usersSize = await MetadataStore.methods.usersSize().call();
    assert.strictEqual(usersSize, '1');
    const offersSize = await MetadataStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '1');
  });

  it("should allow to add new offer only when already a user", async function () {
    await MetadataStore.methods.addOffer(SNT.address, License.address, "London", "EUR", "Iuri", [0], 0, 1).send();
    const usersSize = await MetadataStore.methods.usersSize().call();
    assert.strictEqual(usersSize, '1');
    const offersSize = await MetadataStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '2');
  });

  it("should not allow to add new offer when margin is more than 100", async function () {
    try {
      await MetadataStore.methods.addOffer(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 101).send();
    } catch(error) {
      const usersSize = await MetadataStore.methods.usersSize().call();
      assert.strictEqual(usersSize, '1');
    }
  });

  it("should allow to update a user and offer", async function () {
    await MetadataStore.methods.updateOffer(0, SNT.address, License.address, "Paris", "EUR", "Iuri", [0], 0, 1).send();
    const usersSize = await MetadataStore.methods.usersSize().call();
    assert.strictEqual(usersSize, '1');
    const user = await MetadataStore.methods.users(0).call();
    assert.strictEqual(user.location, 'Paris');

    const offer = await MetadataStore.methods.offers(0).call();
    assert.strictEqual(offer.currency, 'EUR');
  });

  it("should allow to update a user", async function () {
    await MetadataStore.methods.updateUser(SNT.address, "Montreal", "Anthony").send();
    const usersSize = await MetadataStore.methods.usersSize().call();
    assert.strictEqual(usersSize, '1');
    const user = await MetadataStore.methods.users(0).call();
    assert.strictEqual(user.location, 'Montreal');
    assert.strictEqual(user.username, 'Anthony');
  });

  it("should allow to delete an offer", async function () {
    const receipt = await MetadataStore.methods.addOffer(SNT.address, License.address, "London", "EUR", "Iuri", [0], 0, 1).send();
    const offerAdded = receipt.events.OfferAdded;
    const offerId = offerAdded.returnValues.offerId;

    const receipt2 = await MetadataStore.methods.removeOffer(offerId).send();
    const offerRemoved = receipt2.events.OfferRemoved;
    assert(!!offerRemoved, "OfferRemoved() not triggered");
    assert.equal(offerRemoved.returnValues.owner, accounts[0], "Invalid seller");
    assert.equal(offerRemoved.returnValues.offerId, offerId, "Invalid offer");
  });

});
