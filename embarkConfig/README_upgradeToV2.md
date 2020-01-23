### For upgrading on rinkeby:

After running embark run to deploy the missing contract, execute the following in the embark console

```js
OfferStore.options.address = OfferStoreProxy.options.address;
OfferStore.methods.updateCode(OfferStoreV2.options.address).send({gas: 1000000, from: web3.eth.defaultAccount});
OfferStoreV2.options.address = OfferStoreProxy.options.address;
OfferStoreV2.methods.initV2(Medianizer.options.address).send({gas: 1000000, from: web3.eth.defaultAccount});
```



### For upgrading on mainnet:

1. Execute `embark run` to deploy the OfferStoreV2 contract.
2. Save the address in `contracts.json` in the `mainnet` section.
3. Transfer the ownership of the base contract to the multisig
```js
OfferStoreV2.methods.transferOwnership("0x35f7C96C392cD70ca5DBaeDB2005a946A82e8a95").send({gas: 1000000, from: web3.eth.defaultAccount});
```
4. The following custom transactions must be executed in the multisig. To obtain the data and the contract address you need to execute the following commands in the Embark console
  1. Upgrade code
    - to: `OfferStoreProxy.options.address`
    - data: `OfferStore.methods.updateCode(OfferStoreV2.options.address).encodeABI()`
  2. Init v2
    - to: `OfferStoreProxy.options.address`
    - data: `OfferStoreV2.methods.initV2(Medianizer.options.address).encodeABI()`
```

Pending: verify code in etherscan


