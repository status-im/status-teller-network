// /*global contract, config, it, assert*/
const TestUtils = require("../utils/testUtils");

const License = embark.require('Embark/contracts/License');
const Escrow = embark.require('Embark/contracts/Escrow');

let accounts;

config({
  contracts: {
    License: {
      args: [ "0x0", 1 ]
    },
    Escrow: {
      args: ["$License"]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("Escrow", function () {
  const {toBN} = web3.utils;

  this.timeout(0);

  it("Only sellers should be able to create escrows", async () => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 3600;
    const value = web3.utils.toWei("0.1", "ether");
    let receipt;

    try {
      receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    receipt = await License.methods.buy().send({from: accounts[0], value: 1});
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value});

    const created = receipt.events.Created;

    assert(!!created, "Created() not triggered");
    
    assert.equal(created.returnValues.seller, accounts[0], "Invalid seller");
    assert.equal(created.returnValues.buyer, accounts[1], "Invalid buyer");
    assert.equal(created.returnValues.amount, value, "Invalid amount");

    const escrowId = created.returnValues.escrowId;

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


  it("A seller can release the funds for their escrows", async () => {
    let receipt;

    // Valid escrow id only
    try {
      receipt = await Escrow.methods.release(999).send({from: accounts[0]}); // Invalid escrow
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    // Only escrow owner can release funds
    try {
      receipt = await Escrow.methods.release(0).send({from: accounts[1]}); // Buyer tries to release
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    const buyerBalanceBeforeEscrow = await web3.eth.getBalance(accounts[1]);
    receipt = await Escrow.methods.release(0).send({from: accounts[0]});
    const buyerBalanceAfterEscrow = await web3.eth.getBalance(accounts[1]);


    const paid = receipt.events.Paid;
    assert(!!paid, "Paid() not triggered");

    const escrow = await Escrow.methods.transactions(0).call();
    assert.equal(escrow.released, true, "Should have been released");
    assert.equal(toBN(escrow.amount).add(toBN(buyerBalanceBeforeEscrow)), buyerBalanceAfterEscrow, "Invalid buyer balance");
  });

  it("A seller can cancel their escrows", async () => { // TODO: test disputes
    const {toBN} = web3.utils;
    let receipt;

    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;

    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    // Only escrow owner can cancel
    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[1]}); // Buyer tries to cancel
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

    const Canceled = receipt.events.Canceled;
    assert(!!Canceled, "Canceled() not triggered");

    const escrow = await Escrow.methods.transactions(escrowId).call();
    assert.equal(escrow.canceled, true, "Should have been canceled");

    // Only can cancel once
    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }
  });

  it("Released escrow cannot be released again", async() => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
    let receipt;
    
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }
  });

  it("Released escrow cannot be canceled", async() => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
    let receipt;
    
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }
  });

  
  it("Canceled escrow cannot be released", async() => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
    let receipt;
    
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    receipt = await Escrow.methods.cancel(escrowId).send({from: accounts[0]});

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }
  });


  it("Expired escrow cannot be released", async() => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 1000;
    let receipt;
    
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    await TestUtils.increaseTime(1060);

    try {
      receipt = await Escrow.methods.release(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }
  });


  it("Paused contract allows withdrawal by owner", async() => {
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 10000;
    let receipt;
    
    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});
    
    const releasedEscrowId = receipt.events.Created.returnValues.escrowId;

    receipt = await Escrow.methods.release(releasedEscrowId).send({from: accounts[0]});

    receipt = await Escrow.methods.create(accounts[1], expirationTime).send({from: accounts[0], value: "1"});

    const escrowId = receipt.events.Created.returnValues.escrowId;

    try {
      receipt = await Escrow.methods.withdraw_emergency(escrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    receipt = await Escrow.methods.pause().send({from: accounts[0]});

    const paused = receipt.events.Paused;

    assert(!!paused, "Paused() not triggered");

    try {
      receipt = await Escrow.methods.withdraw_emergency(releasedEscrowId).send({from: accounts[0]});
      assert.fail('should have reverted before');
    } catch(error) {
        TestUtils.assertJump(error);
    }

    receipt = await Escrow.methods.withdraw_emergency(escrowId).send({from: accounts[0]});

    const escrow = await Escrow.methods.transactions(escrowId).call();

    assert.equal(escrow.canceled, true, "Should be canceled");
  });
});
