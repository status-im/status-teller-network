/*global contract, config, it, assert, web3, before*/

const TestUtils = require("../utils/testUtils");

const License = require('Embark/contracts/License');
const SNT = require('Embark/contracts/SNT');
const SellerStore = require('Embark/contracts/SellerStore');

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
    SellerStore: {
      args: ["$License"]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("SellerStore", function () {
  before(async () => {
    await SNT.methods.generateTokens(accounts[0], 1000).send();
  });

  it("should not allow to add new seller when not license owner", async function () {
    try {
      await SellerStore.methods.add(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 1).send();
    } catch(error) {
      const sellersSize = await SellerStore.methods.sellersSize().call();
      assert.strictEqual(sellersSize, '0');
    }
  });

  it("should allow to add new seller and offer when license owner", async function () {
    const encodedCall = License.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(License.options.address, 10, encodedCall).send();
    await SellerStore.methods.add(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 1).send();
    const sellersSize = await SellerStore.methods.sellersSize().call();
    assert.strictEqual(sellersSize, '1');
    const offersSize = await SellerStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '1');
  });

  it("should allow to add new offer only when already a seller", async function () {
    await SellerStore.methods.add(SNT.address, License.address, "London", "EUR", "Iuri", [0], 0, 1).send();
    const sellersSize = await SellerStore.methods.sellersSize().call();
    assert.strictEqual(sellersSize, '1');
    const offersSize = await SellerStore.methods.offersSize().call();
    assert.strictEqual(offersSize, '2');
  });

  it("should not allow to add new offer when margin is more than 100", async function () {
    try {
      await SellerStore.methods.add(SNT.address, License.address, "London", "USD", "Iuri", [0], 0, 101).send();
    } catch(error) {
      const sellersSize = await SellerStore.methods.sellersSize().call();
      assert.strictEqual(sellersSize, '1');
    }
  });

  it("should allow to update a seller and offer", async function () {
    await SellerStore.methods.update(0, SNT.address, License.address, "Paris", "EUR", "Iuri", [0], 0, 1).send();
    const sellersSize = await SellerStore.methods.sellersSize().call();
    assert.strictEqual(sellersSize, '1');
    const seller = await SellerStore.methods.sellers(0).call();
    assert.strictEqual(seller.location, 'Paris');

    const offer = await SellerStore.methods.offers(0).call();
    assert.strictEqual(offer.currency, 'EUR');
  });
});
