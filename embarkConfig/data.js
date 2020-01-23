/* eslint-disable complexity */
const async = require('async');


module.exports = async (gasPrice, licensePrice, arbitrationLicensePrice, feeMilliPercent, burnAddress, mainnetOwner, fallbackArbitrator, deps) => {
  try {
    const networkId = await deps.web3.eth.net.getId();

    const estimateAndSend = (from, gasPrice) => async (toSend, value = 0) => {
      const estimatedGas = await toSend.estimateGas({from, value});
      // Don't know why, in the simulator, it fails with a small gas limit
      const additionalGas = networkId === 1337 ? 20000 : 2000;
      return toSend.send({from, gasPrice, value, gas: estimatedGas + additionalGas});
    };

    const addresses = await deps.web3.eth.getAccounts();
    const main = addresses[0];
    const sendTrxAccount0 = estimateAndSend(main, gasPrice);
    const CONTACT_DATA = "Status:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

    {
      console.log("Verifying if data script has been run already...");
      const cVerif = new deps.web3.eth.Contract(deps.contracts.Escrow.options.jsonInterface, deps.contracts.EscrowProxy.options.address);
      const isInitialized = await cVerif.methods.isInitialized().call();
      if (isInitialized) {
        console.log('- Data script already ran once.');
        console.log('- If you want to run it again (eg you updated the Escrow contract), use `embark reset`');
        return;
      }
    }

    {
      console.log("Setting RelayHub address in EscrowRelay");
      let receipt;
      receipt = await sendTrxAccount0(deps.contracts.EscrowRelay.methods.setRelayHubAddress(deps.contracts.RelayHub.options.address));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    if(networkId === 4 || networkId === 3) {
      let receipt;
      console.log("Depositing 0.1 ETH in GSN RelayHub");
      receipt = await sendTrxAccount0(deps.contracts.RelayHub.methods.depositFor(deps.contracts.EscrowRelay.options.address), deps.web3.utils.toWei("0.1", "ether"));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    if(mainnetOwner){
      console.log("Setting ownership of 7 contracts");
      let receipt;
      receipt = await sendTrxAccount0(deps.contracts.Escrow.methods.transferOwnership(mainnetOwner));
      console.log('- 1/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.SellerLicense.methods.transferOwnership(mainnetOwner));
      console.log('- 2/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.ArbitrationLicense.methods.transferOwnership(mainnetOwner));
      console.log('- 3/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.OfferStore.methods.transferOwnership(mainnetOwner));
      console.log('- 4/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.transferOwnership(mainnetOwner));
      console.log('- 5/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.KyberFeeBurner.methods.transferOwnership(mainnetOwner));
      console.log('- 6/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.EscrowRelay.methods.transferOwnership(mainnetOwner));
      console.log('- 7/7: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
    }


    {
      console.log("Setting the initial SellerLicense template calling the init() function");
      deps.contracts.SellerLicense.options.address = deps.contracts.SellerLicenseProxy.options.address;
      const receipt = await sendTrxAccount0(deps.contracts.SellerLicense.methods.init(
        deps.contracts.SNT.options.address,
        licensePrice,
        deps.contracts.KyberFeeBurner.options.address
      ));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }


    {
      console.log("Setting the initial ArbitrationLicense template calling the init() function");
      deps.contracts.ArbitrationLicense.options.address = deps.contracts.ArbitrationLicenseProxy.options.address;
      const receipt = await sendTrxAccount0(deps.contracts.ArbitrationLicense.methods.init(
        deps.contracts.SNT.options.address,
        arbitrationLicensePrice,
        deps.contracts.KyberFeeBurner.options.address
      ));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the initial UserStore template calling the init() function");
      deps.contracts.UserStore.options.address = deps.contracts.UserStoreProxy.options.address;
      const receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.init(
        deps.contracts.SellerLicenseProxy.options.address,
        deps.contracts.ArbitrationLicenseProxy.options.address
      ));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the initial OfferStore template calling the init() function");
      deps.contracts.OfferStore.options.address = deps.contracts.OfferStoreProxy.options.address;
      const receipt = await sendTrxAccount0(deps.contracts.OfferStore.methods.init(
        deps.contracts.UserStore.options.address,
        deps.contracts.SellerLicenseProxy.options.address,
        deps.contracts.ArbitrationLicenseProxy.options.address,
        burnAddress,
        deps.contracts.Medianizer.options.address
      ));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the initial Escrow template calling the init() function");
      deps.contracts.Escrow.options.address = deps.contracts.EscrowProxy.options.address;
      const receipt = await sendTrxAccount0(deps.contracts.Escrow.methods.init(
        fallbackArbitrator || main,
        deps.contracts.EscrowRelay.options.address,
        deps.contracts.ArbitrationLicenseProxy.options.address,
        deps.contracts.OfferStore.options.address,
        deps.contracts.UserStore.options.address,
        deps.contracts.KyberFeeBurner.options.address, // TODO: replace with StakingPool address
        feeMilliPercent
      ));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the Offer store proxy address in UserStore");
      const receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.setAllowedContract(deps.contracts.OfferStore.options.address, true));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the escrow proxy address in UserStore");
      const receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.setAllowedContract(deps.contracts.EscrowProxy.options.address, true));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the escrow proxy address in OfferStore");
      const receipt = await sendTrxAccount0(deps.contracts.OfferStore.methods.setAllowedContract(deps.contracts.EscrowProxy.options.address, true));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the EscrowRelay address in UserStore");
      const receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.setAllowedContract(deps.contracts.EscrowRelay.options.address, true));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }

    {
      console.log("Setting the EscrowRelay address in OfferStore");
      const receipt = await sendTrxAccount0(deps.contracts.OfferStore.methods.setAllowedContract(deps.contracts.EscrowRelay.options.address, true));
      console.log((receipt.status === true || receipt.status === 1) ? '- Success' : '- FAILURE!!!');
    }


    if(mainnetOwner){
      console.log("Setting ownership of 5 proxy");
      let receipt;
      receipt = await sendTrxAccount0(deps.contracts.Escrow.methods.transferOwnership(mainnetOwner));
      console.log('- 1/5: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.SellerLicense.methods.transferOwnership(mainnetOwner));
      console.log('- 2/5: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.ArbitrationLicense.methods.transferOwnership(mainnetOwner));
      console.log('- 3/5: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.OfferStore.methods.transferOwnership(mainnetOwner));
      console.log('- 4/5: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
      receipt = await sendTrxAccount0(deps.contracts.UserStore.methods.transferOwnership(mainnetOwner));
      console.log('- 4/5: ' + ((receipt.status === true || receipt.status === 1) ? 'Success' : 'FAILURE!!!'));
    }

    if(networkId === 1 || networkId === 4 || networkId === 3) {
      console.log("DONE ======================================================================================================");

      const rhBalance = await deps.contracts.RelayHub.methods.balanceOf(deps.contracts.EscrowRelay.options.address).call();
      console.log(`- The GSN Balance for EscrowRelay is ${rhBalance} wei`);
      console.log("- Deposit some ETH on GSN relay with:");
      console.log(`> RelayHub.methods.depositFor(EscrowRelay.options.address).send({value: web3.utils.toWei("0.01", "ether")})`);
      return;
    }


    // Seeding data only on dev environment

    console.log("Seeding data...");

    const arbitrator = addresses[9];

    const sntToken = 10000000;

    console.log('Send ETH...');
    const value = 100 * Math.pow(10, 18);
    let startNonce = await deps.web3.eth.getTransactionCount(main, undefined);
    try {
    await Promise.all(addresses.slice(1, 10).map(async (address, idx) => {
      return deps.web3.eth.sendTransaction({
        to: address,
        from: main,
        value: value.toString(),
        nonce: startNonce + idx,
        gas: 21000
      });
    }));
  } catch(ex){
    console.log(ex);
    return;
  }

    console.log('Generate SNT...');
    await async.eachLimit(addresses, 1, async (address) => {
        const generateToken = deps.contracts.SNT.methods.generateTokens(address, sntToken + '000000000000000000');
        const gas = await generateToken.estimateGas({from: main});
        return generateToken.send({from: main, gas});
    });

    console.log('Generate Standard Tokens');
    const weiToken = "5000000000000";
    await async.eachLimit(addresses.slice(0, 9), 1, async (address) => {
      const generateToken = deps.contracts.StandardToken.methods.mint(address, weiToken.toString());
      const gas = await generateToken.estimateGas({from: main});
      return generateToken.send({from: main, gas});
    });

    console.log("Buy arbitration licenses");
    {
      const buyLicense = deps.contracts.ArbitrationLicense.methods.buy().encodeABI();

      const sendTrxAccountArbi = estimateAndSend(arbitrator, gasPrice);
      const sendTrxAccount8 = estimateAndSend(addresses[8], gasPrice);

      await sendTrxAccountArbi(deps.contracts.SNT.methods.approveAndCall(deps.contracts.ArbitrationLicense._address, arbitrationLicensePrice, buyLicense));
      await sendTrxAccountArbi(deps.contracts.UserStore.methods.addOrUpdateUser(CONTACT_DATA, "Montreal", "Fake Arbitrator"));

      await sendTrxAccount8(deps.contracts.SNT.methods.approveAndCall(deps.contracts.ArbitrationLicense._address, arbitrationLicensePrice, buyLicense));

      // Accepting everyone
      await sendTrxAccountArbi(deps.contracts.ArbitrationLicense.methods.changeAcceptAny(true));
    }

    console.log('Buy Licenses...');
    const buyLicense = deps.contracts.SellerLicense.methods.buy().encodeABI();
    await async.eachLimit(addresses.slice(1, 7), 1, async (address) => {
      const sendTrxAccount = estimateAndSend(address, gasPrice);
      return sendTrxAccount(deps.contracts.SNT.methods.approveAndCall(deps.contracts.SellerLicense._address, licensePrice, buyLicense));
    });

    console.log('Generating Offers...');
    const tokens = [deps.contracts.SNT._address, '0x0000000000000000000000000000000000000000'];
    const paymentMethods = [1, 2, 3];
    const usernames = ['Jonathan', 'Iuri', 'Anthony', 'Barry', 'Richard', 'Ricardo'];
    const locations = ['London', 'Montreal', 'Paris', 'Berlin'];
    const currencies = ['USD', 'EUR'];
    const offerStartIndex = 1;

    const offerReceipts = await async.mapLimit(addresses.slice(offerStartIndex, offerStartIndex + 5), 1, async (address) => {
      const sendTrxAccount = estimateAndSend(address, gasPrice);

      const amountToStake = await deps.contracts.OfferStore.methods.getAmountToStake(address).call();

      return sendTrxAccount(deps.contracts.OfferStore.methods.addOffer(
        tokens[1],
        // TODO un hardcode token and add `approve` in the escrow creation below
        // tokens[Math.floor(Math.random() * tokens.length)],
        'Status:' + address, // Cannot use the utils function, because it uses imports and exports which are not supported by Node 10
        locations[Math.floor(Math.random() * locations.length)],
        currencies[Math.floor(Math.random() * currencies.length)],
        usernames[Math.floor(Math.random() * usernames.length)],
        [paymentMethods[Math.floor(Math.random() * paymentMethods.length)]],
        0,
        0,
        Math.floor(Math.random() * 100),
        arbitrator
      ), amountToStake);
    });

    console.log('Creating escrows and rating them...');
    const val = 1000;
    const feeAmount = Math.round(val * (feeMilliPercent / (100 * 1000)));

    const buyerAddress = addresses[offerStartIndex];
    const escrowStartIndex = offerStartIndex + 1;
    let receipt, hash, signature, nonce, created, escrowId;

    await async.eachOfLimit(addresses.slice(escrowStartIndex, escrowStartIndex + 1), 1, async (creatorAddress, idx) => {
      const ethOfferId = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.offerId;
      // TODO when we re-enable creating tokens too, use this to know
      // const token = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.asset;

      // Create
      hash = await deps.contracts.UserStore.methods.getDataHash(usernames[offerStartIndex], CONTACT_DATA).call({from: buyerAddress});
      signature = await deps.web3.eth.sign(hash, buyerAddress);
      nonce = await deps.contracts.UserStore.methods.user_nonce(buyerAddress).call();

      const sendTrxAccount = estimateAndSend(creatorAddress, gasPrice);

      receipt = await sendTrxAccount(deps.contracts.Escrow.methods.createEscrow(ethOfferId, val, 140, creatorAddress, CONTACT_DATA, locations[offerStartIndex], usernames[offerStartIndex], nonce, signature));

      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund
      receipt = await sendTrxAccount(deps.contracts.Escrow.methods.fund(escrowId), val + feeAmount);

      // Release
      receipt = await sendTrxAccount(deps.contracts.Escrow.methods.release(escrowId));

      // Rate
      const rating = Math.floor(Math.random() * 5) + 1;
      await sendTrxAccount(deps.contracts.Escrow.methods.rateTransaction(escrowId, rating));
    });

    const sendTrxAccountBuyer = estimateAndSend(buyerAddress, gasPrice);
    console.log('Creating arbitrations');
    await async.eachOfLimit(addresses.slice(escrowStartIndex, 5), 1, async (creatorAddress, idx) => {
      const sendTrxAccount = estimateAndSend(creatorAddress, gasPrice);
      const ethOfferId = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.offerId;
      let receipt;

      hash = await deps.contracts.UserStore.methods.getDataHash(usernames[offerStartIndex], CONTACT_DATA).call({from: buyerAddress});
      signature = await deps.web3.eth.sign(hash, buyerAddress);
      nonce = await deps.contracts.UserStore.methods.user_nonce(buyerAddress).call();

      receipt = await sendTrxAccount(deps.contracts.Escrow.methods.createEscrow(ethOfferId, val, 140, creatorAddress, CONTACT_DATA, locations[offerStartIndex], usernames[offerStartIndex], nonce, signature));

      created = receipt.events.Created;
      escrowId = created.returnValues.escrowId;

      // Fund
      await sendTrxAccount(deps.contracts.Escrow.methods.fund(escrowId), val + feeAmount);

      // Buyer pays
      await sendTrxAccountBuyer(deps.contracts.Escrow.methods.pay(escrowId));

      // Open case
      await sendTrxAccountBuyer(deps.contracts.Escrow.methods.openCase(escrowId, '1'));
    });

    const accounts = await async.mapLimit(addresses, 1, async (address) => {
      const ethBalance = await deps.web3.eth.getBalance(address);
      const sntBalance = await deps.contracts.SNT.methods.balanceOf(address).call();
      const isLicenseOwner = await deps.contracts.SellerLicense.methods.isLicenseOwner(address).call();
      let offers = [];
      const user = await deps.contracts.UserStore.methods.users(address).call();
      if (user) {
        const offerIds = await deps.contracts.OfferStore.methods.getOfferIds(address).call();
        offers = await Promise.all(offerIds.map(async(offerId) => (
          deps.contracts.OfferStore.methods.offer(offerId).call()
        )));
      }
      return {
        address,
        isLicenseOwner,
        isUser: !!user,
        user,
        offers,
        ethBalance: deps.web3.utils.fromWei(ethBalance),
        sntBalance: deps.web3.utils.fromWei(sntBalance)
      };
    });

    console.log('Summary:');
    console.log('######################');
    accounts.forEach((account) => {
      console.log(`Address: ${account.address}:`);
      console.log(`License Owner: ${account.isLicenseOwner} ETH: ${account.ethBalance} SNT: ${account.sntBalance}`);
      console.log(`Is User: ${account.isUser} Username: ${account.user.username || 'N/A'} Offers: ${account.offers.length}`);
      console.log('');
    });
  } catch (e) {
    console.log("------- data seeding error ------- ");
    console.dir(e);
  }
};
