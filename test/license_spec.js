/*global contract, config, it, assert*/

const TestUtils = require("../utils/testUtils");

const License = require('Embark/contracts/License');
const SNT = require('Embark/contracts/SNT');

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
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("License", function () {
  const {toBN} = web3.utils;

  before(async () => {
    const receipt = await SNT.methods.generateTokens(accounts[0], 1000).send();
  });

  it("should set recipient and price on instantiation", async function () {
    const recipient = await License.methods.getRecipient().call();
    const price = await License.methods.getPrice().call();
    const releaseDelay = await License.methods.getReleaseDelay().call();
    assert.strictEqual(parseInt(price, 10), 10);
    assert.strictEqual(parseInt(releaseDelay, 10), 86400 * 365);
    assert.strictEqual(recipient, TestUtils.zeroAddress);
  });


  it("should not allow to buy license when price is incorrect", async function() {
    try {
      await SNT.methods.approve(License.options.address, 5).send();
      await License.methods.buy().send({from: accounts[0]});
    } catch(error) {
      assert.strictEqual(error.message, "VM Exception while processing transaction: revert Allowance not set for this contract to expected price");
    }
  });

  it("should allow to buy license", async function() {
    let isLicenseOwner = await License.methods.isLicenseOwner(accounts[0]).call();
    assert.strictEqual(isLicenseOwner, false);

    await SNT.methods.approve(License.options.address, 0).send({from: accounts[0]}); // Needs to set allowance to 0 first
    await SNT.methods.approve(License.options.address, 10).send({from: accounts[0]});
    await License.methods.buy().send({from: accounts[0]});
    
    isLicenseOwner = await License.methods.isLicenseOwner(accounts[0]).call();
    assert.strictEqual(isLicenseOwner, true);
    const contractBalance = await SNT.methods.balanceOf(License.options.address).call();
    assert.strictEqual(contractBalance, "10", "Contract balance is incorrect");

  });

  it("should not allow to buy license when the address already owns one", async function() {
    try {
      await SNT.methods.approve(License.options.address, 10).send({from: accounts[0]});
      await License.methods.buy().send({from: accounts[0]});
    } catch(error) {
      assert.strictEqual(error.message, "VM Exception while processing transaction: revert License already bought");
    }
  });

  it("should not allow to set the price if not the owner", async function() {
    try {
      await License.methods.setPrice(10).send({from: accounts[1]});
    } catch (error) {
      assert.ok(error.message.indexOf('revert') > -1);
    }
  });

  it("should allow to set the price if owner", async function() {
    await License.methods.setPrice(10).send({from: accounts[0]});
    const price = await License.methods.getPrice().call();
    assert.strictEqual(parseInt(price, 10), 10);
  });

  it("should not allow set the recipient if not the owner", async function() {
    try {
      await License.methods.setRecipient(accounts[1]).send({from: accounts[1]});
    } catch (error) {
      assert.ok(error.message.indexOf('revert') > -1);
    }
  });

  it("should allow to set the recipient if owner", async function() {
    await License.methods.setRecipient(accounts[0]).send({from: accounts[0]});
    const recipient = await License.methods.getRecipient().call();
    assert.strictEqual(recipient, accounts[0]);
  });

  it("should not allow to release the license if release delay time hasn't passed", async function () {
    try {
      await License.methods.release().send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
      assert.strictEqual(error.message, "VM Exception while processing transaction: revert Release period not reached.");
    }
  });

  it("should allow to release the license once release delay time has passed", async function () {
      await TestUtils.increaseTime(86400 * 366);

      const balanceBeforeRelease = await SNT.methods.balanceOf(accounts[0]).call();
      const receipt = await License.methods.release().send({from: accounts[0]});
      const balanceAfterRelease = await SNT.methods.balanceOf(accounts[0]).call();

      const released = receipt.events.Released;
      assert(!!released, "Released() not triggered");

      let isLicenseOwner = await License.methods.isLicenseOwner(accounts[0]).call();

      assert(toBN(balanceBeforeRelease).add(toBN(10)), toBN(balanceAfterRelease), "User balance is incorrect");
      assert.strictEqual(isLicenseOwner, false, "User should not be a seller");
  });
});
