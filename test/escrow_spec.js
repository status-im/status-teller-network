/*global contract, config, it, assert, embark, web3*/
const TestUtils = require("../utils/testUtils");

const License = embark.require('Embark/contracts/License');
const Escrow = embark.require('Embark/contracts/Escrow');

let accounts;

config({
  contracts: {
    License: {
      args: ["0x0000000000000000000000000000000000000000", 1]
    },
    Escrow: {
      args: ["$License"]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("Escrow", function() {
  const {toBN} = web3.utils;
  const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 3600;
  const value = web3.utils.toWei("0.1", "ether");

  let receipt, escrowId;

  this.timeout(0);


  it("Non-seller must not be able to create escrows", async () => {
    try {
      await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Seller should be able to create escrows", async () => {
    let receipt;

    receipt = await License.methods.buy().send({from: accounts[0], value: 1});
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value});

    const created = receipt.events.Created;

    assert(!!created, "Created() not triggered");

    assert.equal(created.returnValues.seller, accounts[0], "Invalid seller");
    assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    assert.equal(created.returnValues.amount, value, "Invalid amount");

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


  it("An invalid escrow cannot be released", async () => {
    try {
      await Escrow.methods.release(999).send({from: accounts[0]}); // Invalid escrow
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Accounts different from the escrow owner cannot release an escrow", async () => {
    try {
      await Escrow.methods.release(0).send({from: accounts[1]}); // Buyer tries to release
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Escrow owner can release his funds to the buyer", async () => {
    const buyerBalanceBeforeEscrow = await web3.eth.getBalance(accounts[1]);
    receipt = await Escrow.methods.release(0).send({from: accounts[0]});
    const buyerBalanceAfterEscrow = await web3.eth.getBalance(accounts[1]);

    const paid = receipt.events.Paid;
    assert(!!paid, "Paid() not triggered");

    const escrow = await Escrow.methods.transactions(0).call();
    assert.equal(escrow.released, true, "Should have been released");
    assert.equal(toBN(escrow.amount).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
  });


  it("Accounts different from the escrow owner cannot cancel escrows", async () => {
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});
    escrowId = receipt.events.Created.returnValues.escrowId;

    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[1]}); // Buyer tries to cancel
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("A seller can cancel their escrows", async () => {
    receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

    const Canceled = receipt.events.Canceled;
    assert(!!Canceled, "Canceled() not triggered");

    const escrow = await Escrow.methods.transactions(escrowId).call();
    assert.equal(escrow.canceled, true, "Should have been canceled");

  });


  it("An escrow can only be canceled once", async () => {
    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Released escrow cannot be released again", async () => {
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});
    escrowId = receipt.events.Created.returnValues.escrowId;

    await Escrow.methods.release(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Released escrow cannot be canceled", async () => {
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    escrowId = receipt.events.Created.returnValues.escrowId;

    await Escrow.methods.release(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Canceled escrow cannot be released", async () => {
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    escrowId = receipt.events.Created.returnValues.escrowId;

    await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Expired escrow cannot be released", async () => {
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    escrowId = receipt.events.Created.returnValues.escrowId;

    await TestUtils.increaseTime(1060);

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch (error) {
      TestUtils.assertJump(error);
    }
  });


  it("Paused contract allows withdrawal by owner only on active escrows", async () => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 10000;

    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const releasedEscrowId = receipt.events.Created.returnValues.escrowId;

    await Escrow.methods.release(releasedEscrowId).send({from: accounts[0]});

    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    escrowId = receipt.events.Created.returnValues.escrowId;

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

    receipt = await Escrow.methods.withdraw_emergency(escrowId).send({from: accounts[0]});

    const escrow = await Escrow.methods.transactions(escrowId).call();

    assert.equal(escrow.canceled, true, "Should be canceled");
  });
});
