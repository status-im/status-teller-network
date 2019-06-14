/*global contract, config, it, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");

const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const Escrow = embark.require('Embark/contracts/Escrow');
const StandardToken = embark.require('Embark/contracts/StandardToken');
const SNT = embark.require('Embark/contracts/SNT');

const FIAT = 0;

let accounts;
const feeAmount = 10;
const fundAmount = 100;

config({
  deployment: {
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
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
      args: ["$SNT", 10]
    },
    MetadataStore: {
      args: ["$SellerLicense", "$ArbitrationLicense"]
    },
    ArbitrationLicense: {
      instanceOf: "License",
      args: ["$SNT", 10]
    },
    Escrow: {
      args: ["$SellerLicense", "$ArbitrationLicense", "$MetadataStore", "$SNT", "0x0000000000000000000000000000000000000001", feeAmount],
      onDeploy: [
        "MetadataStore.methods.setEscrowAddress('$Escrow').send()"
      ]
    },
    StandardToken: {
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

function sequentialPromiseExec(tasks) {
  return tasks.reduce((p, task) => p.then(task), Promise.resolve());
}

contract("Escrow Funding", function() {
  const {toBN} = web3.utils;
  const value = web3.utils.toWei("0.1", "ether");

  let expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 10000;

  let receipt, escrowId, ethOfferId, tokenOfferId, SNTOfferId, arbitrator;

  this.timeout(0);

  before(async () => {
    await StandardToken.methods.mint(accounts[0], 100000000).send();
    await SNT.methods.generateTokens(accounts[0], 100000000).send();
    const encodedCall = SellerLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(SellerLicense.options.address, 10, encodedCall).send({from: accounts[0]});

    // Register arbitrators
    arbitrator = accounts[9];
    await SNT.methods.generateTokens(arbitrator, 1000).send();
    const encodedCall2 = ArbitrationLicense.methods.buy().encodeABI();
    await SNT.methods.approveAndCall(ArbitrationLicense.options.address, 10, encodedCall2).send({from: arbitrator});

    const hash = await MetadataStore.methods.getDataHash("Iuri", "0x00", "London").call();
    const signature = await web3.eth.sign(hash, accounts[0]);

    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress,signature, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

    receipt  = await MetadataStore.methods.addOffer(StandardToken.options.address, signature, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    tokenOfferId = receipt.events.OfferAdded.returnValues.offerId;

    receipt  = await MetadataStore.methods.addOffer(SNT.options.address, signature, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    SNTOfferId = receipt.events.OfferAdded.returnValues.offerId;
  });

  describe("ETH as asset", async () => {
    beforeEach(async () => {
      
      const hash = await MetadataStore.methods.getDataHash("Iuri", "0x00", "London").call();
      const signature = await web3.eth.sign(hash, accounts[1]);

      receipt = await Escrow.methods.create(signature, ethOfferId, 123, FIAT, value, "0x00", "U", "12345")
                                    .send({from: accounts[0]});

      escrowId = receipt.events.Created.returnValues.escrowId;
    });

    it("Should fund escrow and deduct an SNT fee", async () => {
      // Still requires 2 transactions, because approveAndCall cannot send ETH
      // TODO: test if inside the contract we can encode the call, and call approveAndCall

      await SNT.methods.approve(Escrow.options.address, feeAmount).send({from: accounts[0]});

      receipt = await Escrow.methods.fund(escrowId, value, expirationTime)
                                    .send({from: accounts[0], value});

    });
  });

  describe("Tokens as Asset", async () => {
    let escrowIdSNT, escrowIdToken;

    beforeEach(async () => {

      const hash = await MetadataStore.methods.getDataHash("Iuri", License.address, "London").call();
      const signature = await web3.eth.sign(hash, accounts[1]);
      
      // Reset allowance
      await SNT.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});
      await StandardToken.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});

      receipt = await Escrow.methods.create(signature, SNTOfferId, 123, FIAT, value, "0x00", "U", "12345")
                                    .send({from: accounts[0]});
      escrowIdSNT = receipt.events.Created.returnValues.escrowId;

      receipt = await Escrow.methods.create(signature, tokenOfferId, 123, FIAT, value, "0x00", "U", "12345")
                                    .send({from: accounts[0]});
      escrowIdToken = receipt.events.Created.returnValues.escrowId;
    });

    const execute = async (token, escrowId) => {
      const {approvalPromises, trxToSend} = await tokenApprovalAndBuildTrx(token, escrowId);
      await sequentialPromiseExec(approvalPromises);
      await trxToSend.send({from: accounts[0]});
    };

    it("Allowance == to funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, escrowIdSNT);
    });

    it("Allowance > to funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, escrowIdSNT);
    });

    it("Allowance < than funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).sub(toBN(10)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, escrowIdSNT);
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, escrowIdToken);
    });

    const tokenApprovalAndBuildTrx = async (token, escrowId) => {
      const tokenAllowance = await token.methods.allowance(accounts[0], Escrow.options.address).call();

      const toSend = Escrow.methods.fund(escrowId, fundAmount, expirationTime);
      const encodedCall = toSend.encodeABI();

      let approvalPromises = [];
      let trxToSend;

      const resetApproval = (token, tokenAllowance) => {
        // Reset approval
        // due to: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        if(toBN(tokenAllowance).gt(toBN(0))){
          approvalPromises.push(token.methods.approve(Escrow.options.address, "0").send({from: accounts[0]}));
        }
      };

      if (token.options.address === SNT.options.address){
        // Both tokens and fee are in SNT.
        const sntAmount = fundAmount + feeAmount;
        if(toBN(tokenAllowance).gte(toBN(sntAmount))){
          trxToSend = toSend;
        } else {
          resetApproval(SNT, tokenAllowance);
          trxToSend = SNT.methods.approveAndCall(Escrow.options.address, sntAmount, encodedCall);
        }
      } else {
        // Verifying token allowance for funding
        if(toBN(tokenAllowance).lt(toBN(fundAmount))){
          resetApproval(token, tokenAllowance);
          approvalPromises.push(token.methods.approve(Escrow.options.address, fundAmount).send({from: accounts[0]}));
        }

        // Verifying SNT allowance for fees
        const sntAllowance = await SNT.methods.allowance(accounts[0], Escrow.options.address).call();
        if(toBN(sntAllowance).gte(toBN(feeAmount))){
          trxToSend = toSend; // Enough funds. Execute directly.
        } else {
          resetApproval(SNT, tokenAllowance); // Has some funds. Reset
          trxToSend = SNT.methods.approveAndCall(Escrow.options.address, feeAmount, encodedCall);
        }
      }

      return { approvalPromises, trxToSend};
    };
  });

});
