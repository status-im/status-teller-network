/*global contract, config, it, assert*/

const License = require('Embark/contracts/License');

let accounts;

const zeroAddress = "0x0000000000000000000000000000000000000000";

config({
  contracts: {
    License: {
      args: [zeroAddress, 1]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("License", function() {
  it("should set recipient and price on instantiation", async function() {
    const recipient = await License.methods.getRecipient().call();
    const price = await License.methods.getPrice().call();
    assert.strictEqual(parseInt(price, 10), 1);
    assert.strictEqual(recipient, zeroAddress);
  });


  it("should not allow to buy license when price is incorrect", async function() {
    try {
      await License.methods.buy().send({value: 2, from: accounts[0]});
    } catch (error) {
      assert.ok(error.message.indexOf('revert') > -1);
    }
  });

  it("should allow to buy license", async function() {
    let isLicenseOwner = await License.methods.isLicenseOwner(accounts[0]).call();
    assert.strictEqual(isLicenseOwner, false);
    await License.methods.buy().send({value: 1, from: accounts[0]});
    isLicenseOwner = await License.methods.isLicenseOwner(accounts[0]).call();
    assert.strictEqual(isLicenseOwner, true);
  });

  it("should not allow to buy license when the address already owns one", async function() {
    try {
      await License.methods.buy().send({value: 1, from: accounts[0]});
    } catch (error) {
      assert.ok(error.message.indexOf('revert') > -1);
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
});
