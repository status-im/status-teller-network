module.exports = async (licensePrice, feeAmount, deps) => {
  try {
    const addresses = await deps.web3.eth.getAccounts();
    const main = addresses[0];
    const sntToken = 10000000;
    const balance = await deps.contracts.SNT.methods.balanceOf(main).call();
    if (balance !== '0') {
      return;
    }

    console.log("Seeding data...");

    console.log('Send ETH...');
    const value = 100 * Math.pow(10, 18);
    await Promise.all(addresses.slice(1, 10).map(async (address) => {
      return deps.web3.eth.sendTransaction({
        to: address,
        from: main,
        value: value.toString()
      });
    }));

    console.log('Generate SNT...');
    await Promise.all(addresses.slice(0, 8).map(async (address) => {
      const generateToken = deps.contracts.SNT.methods.generateTokens(address, sntToken + '000000000000000000');
      const gas = await generateToken.estimateGas({from: main});
      return generateToken.send({from: main, gas});
    }));

    console.log('Generate Standard Tokens');
    const weiToken = "5000000000000";
    await Promise.all(addresses.slice(0, 8).map(async (address) => {
      const generateToken = deps.contracts.StandardToken.methods.mint(address, weiToken.toString());
      const gas = await generateToken.estimateGas({from: main});
      return generateToken.send({from: main, gas});
    }));

    console.log('Buy Licenses...');
    await Promise.all(addresses.slice(1, 8).map(async (address) => {
      const buyLicense = deps.contracts.License.methods.buy().encodeABI();
      const toSend = deps.contracts.SNT.methods.approveAndCall(deps.contracts.License._address, licensePrice, buyLicense);

      const gas = await toSend.estimateGas({from: address});
      return toSend.send({from: address, gas});
    }));

    console.log('Generating Offers...');
    const tokens = [deps.contracts.SNT._address, '0x0000000000000000000000000000000000000000'];
    const paymentMethods = [0, 1, 2];
    const usernames = ['Jonathan', 'Iuri', 'Anthony', 'Barry', 'Richard', 'Ricardo'];
    const locations = ['London', 'Montreal', 'Paris', 'Berlin'];
    const currencies = ['USD', 'EUR'];
    const marketTypes = [0, 1];
    const offerStartIndex = 1;

    const offerReceipts = await Promise.all(addresses.slice(offerStartIndex, 5).map(async (address) => {
      const addOffer = deps.contracts.MetadataStore.methods.addOffer(
        tokens[1],
        // TODO un hardcode token and add `approve` in the escrow creation below
        // tokens[Math.floor(Math.random() * tokens.length)],
        address,
        locations[Math.floor(Math.random() * locations.length)],
        currencies[Math.floor(Math.random() * currencies.length)],
        usernames[Math.floor(Math.random() * usernames.length)],
        [paymentMethods[Math.floor(Math.random() * paymentMethods.length)]],
        marketTypes[Math.floor(Math.random() * marketTypes.length)],
        Math.floor(Math.random() * 100)
      );

      const gas = await addOffer.estimateGas({from: address});
      return addOffer.send({from: address, gas});
    }));

    console.log('Creating escrows and rating them...');
    const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 10000;
    const FIAT = 0;
    const val = 1000;

    const buyerAddress = addresses[offerStartIndex];
    const escrowStartIndex = offerStartIndex + 1;
    await Promise.all(addresses.slice(escrowStartIndex, 5).map(async (creatorAddress, idx) => {
      const ethOfferId = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.offerId;
      // TODO when we re-enable creating tokens too, use this to know
      // const token = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.asset;

      let gas;

      const approval = deps.contracts.SNT.methods.approve(deps.contracts.Escrow.options.address, feeAmount);
      gas = await approval.estimateGas({from: creatorAddress});
      await approval.send({from: creatorAddress, gas: gas + 1000});

      const creation = deps.contracts.Escrow.methods.create_and_fund(buyerAddress, ethOfferId, val, expirationTime, 123, FIAT, 13555);
      gas = await creation.estimateGas({from: creatorAddress, value: val});
      const receipt = await creation.send({from: creatorAddress, value: val, gas: gas + 1000});
      const created = receipt.events.Created;
      const escrowId = created.returnValues.escrowId;

      const release = deps.contracts.Escrow.methods.release(escrowId);
      gas = await release.estimateGas({from: creatorAddress});
      await release.send({from: creatorAddress, gas: gas + 1000});

      const rating = Math.floor(Math.random() * 5) + 1;
      const rate = deps.contracts.Escrow.methods.rateTransaction(escrowId, rating);
      gas = await rate.estimateGas({from: buyerAddress});
      await rate.send({from: buyerAddress, gas: gas + 1000});
    }));

    
    console.log('Creating arbitrations');

    
    await Promise.all(addresses.slice(escrowStartIndex, 5).map(async (creatorAddress, idx) => {
      const ethOfferId = offerReceipts[idx - offerStartIndex + escrowStartIndex].events.OfferAdded.returnValues.offerId;
      let gas, receipt;

      const approval = deps.contracts.SNT.methods.approve(deps.contracts.Escrow.options.address, feeAmount);
      gas = await approval.estimateGas({from: creatorAddress});
      await approval.send({from: creatorAddress, gas: gas + 1000});

      const creation = deps.contracts.Escrow.methods.create_and_fund(buyerAddress, ethOfferId, val, expirationTime, 123, FIAT, 13555);
      gas = await creation.estimateGas({from: creatorAddress, value: val});
      receipt = await creation.send({from: creatorAddress, value: val, gas: gas + 1000});
      const created = receipt.events.Created;
      const escrowId = created.returnValues.escrowId;

      const pay = deps.contracts.Escrow.methods.pay(escrowId);
      gas = await pay.estimateGas({from: buyerAddress});
      receipt = await pay.send({from: buyerAddress, gas: gas + 1000});
      
      const openCase = deps.contracts.Escrow.methods.openCase(escrowId);
      gas = await openCase.estimateGas({from: buyerAddress});
      receipt = await openCase.send({from: buyerAddress, gas: gas + 1000});
    }));

    const accounts = await Promise.all(addresses.map(async(address) => {
      const ethBalance = await deps.web3.eth.getBalance(address);
      const sntBalance = await deps.contracts.SNT.methods.balanceOf(address).call();
      const isLicenseOwner = await deps.contracts.License.methods.isLicenseOwner(address).call();
      let user = {};
      let offers = [];
      const isUser = await deps.contracts.MetadataStore.methods.userWhitelist(address).call();
      if (isUser) {
        const userId = await deps.contracts.MetadataStore.methods.addressToUser(address).call();
        user = await deps.contracts.MetadataStore.methods.users(userId).call();
        const offerIds = await deps.contracts.MetadataStore.methods.getOfferIds(address).call();
        offers = await Promise.all(offerIds.map(async(offerId) => (
          deps.contracts.MetadataStore.methods.offer(offerId).call()
        )));
      }
      return {
        address,
        isLicenseOwner,
        isUser,
        user,
        offers,
        ethBalance: deps.web3.utils.fromWei(ethBalance),
        sntBalance: deps.web3.utils.fromWei(sntBalance)
      };
    }));

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
