const LICENSE_PRICE = "10000000000000000000"; // 10 * Math.pow(10, 18)

module.exports = async (deps) => {
  try {
    const addresses = await deps.web3.eth.getAccounts();
    const main = addresses[0];
    const sntToken = 100;
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
    const weiSnt = sntToken * Math.pow(10, 18);
    await Promise.all(addresses.slice(0, 8).map(async (address) => {
      const generateToken = deps.contracts.SNT.methods.generateTokens(address, weiSnt.toString());
      const gas = await generateToken.estimateGas({from: main});
      return generateToken.send({from: main, gas});
    }));

    console.log('Buy Licenses...');
    await Promise.all(addresses.slice(1, 8).map(async (address) => {
      const buyLicense = deps.contracts.License.methods.buy().encodeABI();
      const toSend = deps.contracts.SNT.methods.approveAndCall(deps.contracts.License._address, LICENSE_PRICE, buyLicense);

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

    await Promise.all(addresses.slice(1, 5).map(async (address) => {
      const addOffer = deps.contracts.MetadataStore.methods.addOffer(
        tokens[Math.floor(Math.random()*tokens.length)],
        address,
        locations[Math.floor(Math.random()*locations.length)],
        currencies[Math.floor(Math.random()*currencies.length)],
        usernames[Math.floor(Math.random()*usernames.length)],
        [paymentMethods[Math.floor(Math.random()*paymentMethods.length)]],
        marketTypes[Math.floor(Math.random()*marketTypes.length)],
        Math.floor(Math.random() * 100)
      );

      const gas = await addOffer.estimateGas({from: address});
      return addOffer.send({from: address, gas});
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
    console.log("------- data seeding error ------- ")
    console.dir(e)
  }
}
