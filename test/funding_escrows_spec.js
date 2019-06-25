/*global contract, config, it, embark, web3, before, describe, beforeEach*/
const TestUtils = require("../utils/testUtils");

const SellerLicense = embark.require('Embark/contracts/SellerLicense');
const MetadataStore = embark.require('Embark/contracts/MetadataStore');
const ArbitrationLicense = embark.require('Embark/contracts/ArbitrationLicense');
const Arbitrations = embark.require('Embark/contracts/Arbitrations');
const Escrow = embark.require('Embark/contracts/Escrow');
const StandardToken = embark.require('Embark/contracts/StandardToken');
const EscrowRelay = embark.require('Embark/contracts/EscrowRelay');
const EscrowManagement = embark.require('Embark/contracts/EscrowManagement');
const SNT = embark.require('Embark/contracts/SNT');

const FIAT = 0;
const FEE_MILLI_PERCENT = 1000;

let accounts;
const fundAmount = 100;

const feePercent = 1;
const feeAmount = Math.round(fundAmount * (feePercent / 100));

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
      args: ["$SNT", 10, "$StakingPool"]
    },
    MetadataStore: {
      args: ["$SellerLicense", "$ArbitrationLicense"]
    },
    ArbitrationLicense: {
      instanceOf: "License",
      args: ["$SNT", 10, "$StakingPool"]
    },
    Arbitrations: {
      args: ["$ArbitrationLicense"]
    },
    StakingPool: {
      file: 'staking-pool/contracts/StakingPool.sol',
      args: ["$SNT"]
    },
    Escrow: {
      args: ["$EscrowRelay", "$SellerLicense", "$Arbitrations", "$MetadataStore", "0x0000000000000000000000000000000000000002", feePercent * 1000]
    },
    EscrowRelay: {
      "args": ["$EscrowManagement", "$MetadataStore"]
    },
    EscrowManagement: {},
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
  const value = fundAmount + feeAmount;

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

    receipt  = await MetadataStore.methods.addOffer(TestUtils.zeroAddress, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    ethOfferId = receipt.events.OfferAdded.returnValues.offerId;

    receipt  = await MetadataStore.methods.addOffer(StandardToken.options.address, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    tokenOfferId = receipt.events.OfferAdded.returnValues.offerId;

    receipt  = await MetadataStore.methods.addOffer(SNT.options.address, "0x00", "London", "USD", "Iuri", [0], 1, arbitrator).send({from: accounts[0]});
    SNTOfferId = receipt.events.OfferAdded.returnValues.offerId;

    const abiEncode = Escrow.methods.init(
      EscrowRelay.options.address,
      SellerLicense.options.address,
      Arbitrations.options.address,
      MetadataStore.options.address,
      "0x0000000000000000000000000000000000000002",
      FEE_MILLI_PERCENT
    ).encodeABI();

    await EscrowManagement.methods.setTemplate(Escrow.options.address, abiEncode).send();
  });

  describe("ETH as asset", async () => {
    beforeEach(async () => {

      const hash = await MetadataStore.methods.getDataHash("Iuri", "0x00").call({from: accounts[1]});
      const nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();
      const signature = await web3.eth.sign(hash, accounts[1]);

      receipt = await EscrowManagement.methods.create(ethOfferId, fundAmount, FIAT, 140, "0x00", "U", "Iuri", nonce, signature)
                                    .send({from: accounts[0]});

      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
    });

    it("Should fund escrow and deduct an SNT fee", async () => {
      // Still requires 2 transactions, because approveAndCall cannot send ETH
      // TODO: test if inside the contract we can encode the call, and call approveAndCall

      receipt = await Escrow.methods.fund(fundAmount, expirationTime)
                                    .send({from: accounts[0], value: fundAmount + feeAmount});

    });
  });

  const execute = async (token, contract) => {
    const {approvalPromises, trxToSend} = await tokenApprovalAndBuildTrx(token, contract);
    await sequentialPromiseExec(approvalPromises);
    await trxToSend.send({from: accounts[0]});
  };


  const tokenApprovalAndBuildTrx = async (token, contract) => {
    const tokenAllowance = await token.methods.allowance(accounts[0], contract.options.address).call();

    const toSend = contract.methods.fund(fundAmount, expirationTime);
    // const encodedCall = toSend.encodeABI();

    let approvalPromises = [];
    let trxToSend;

    const resetApproval = (token, tokenAllowance) => {
      // Reset approval
      // due to: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
      if(toBN(tokenAllowance).gt(toBN(0))){
        approvalPromises.push(token.methods.approve(contract.options.address, "0").send({from: accounts[0]}));
      }
    };

    // Verifying token allowance for funding
    if (toBN(tokenAllowance).lt(toBN(fundAmount))) {
      resetApproval(token, tokenAllowance);
      approvalPromises.push(token.methods.approve(contract.options.address, fundAmount + feeAmount).send({from: accounts[0]}));
    }

    trxToSend = toSend; // Enough funds. Execute directly.

    return {approvalPromises, trxToSend};
  };

  describe("Only SNT as Asset", async () => {
    beforeEach(async () => {
      // Reset allowance
      await SNT.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});
      await StandardToken.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});

      let hash = await MetadataStore.methods.getDataHash("Iuri", "0x00").call({from: accounts[1]});
      let signature = await web3.eth.sign(hash, accounts[1]);
      let nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await EscrowManagement.methods.create(SNTOfferId, fundAmount, FIAT, 140, "0x00", "U", "Iuri", nonce, signature)
                                    .send({from: accounts[0]});

      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
    });

    it("Allowance == to funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, Escrow);
    });

    it("Allowance > to funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, Escrow);
    });

    it("Allowance < than funds and fee. Token is SNT", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).sub(toBN(10)).toString(10);
      await SNT.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(SNT, Escrow);
    });
  });

  describe("Other tokens as Asset", async () => {
    beforeEach(async () => {
      // Reset allowance
      await SNT.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});
      await StandardToken.methods.approve(Escrow.options.address, "0").send({from: accounts[0]});

      let hash = await MetadataStore.methods.getDataHash("Iuri", "0x00").call({from: accounts[1]});
      let signature = await web3.eth.sign(hash, accounts[1]);
      let nonce = await MetadataStore.methods.user_nonce(accounts[1]).call();

      receipt = await EscrowManagement.methods.create(tokenOfferId, fundAmount, FIAT, 140, "0x00", "U", "Iuri", nonce, signature)
                                    .send({from: accounts[0]});

      Escrow.options.address = receipt.events.InstanceCreated.returnValues.instance;
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount + feeAmount).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance == required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount + feeAmount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance > required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1000).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance == to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      await StandardToken.methods.approve(Escrow.options.address, fundAmount + feeAmount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance > to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      const amount = toBN(feeAmount).add(toBN(fundAmount)).add(toBN(100)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

    it("Allowance < to required funds. Token is not SNT. SNT Allowance < required Fees", async () => {
      const amount = toBN(fundAmount).sub(toBN(10)).toString(10);
      await StandardToken.methods.approve(Escrow.options.address, amount).send({from: accounts[0]});
      await SNT.methods.approve(Escrow.options.address, 1).send({from: accounts[0]});

      await execute(StandardToken, Escrow);
    });

  });

});
