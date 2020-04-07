[![Build Status](https://travis-ci.org/status-im/status-teller-network.svg?branch=master)](https://travis-ci.org/status-im/status-teller-network) [![Join the chat at https://gitter.im/status-im/status-teller-network](https://badges.gitter.im/status-im/status-teller-network.svg)](https://gitter.im/status-im/status-teller-network?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# status-teller-network

Teller is a DApp which provides a platform for borderless, peer-to-peer, fiat-to-crypto echanges that allows Stakeholders to find nearby users to exchange their cash for digital assets and currency.

From the whitepaper https://status.im/whitepaper.pdf

*One of the core hurdles to the adoption of cryptocurrency is the dificulty in obtaining it. Ease of access is necessary to transition our economies from fiat to digital currency.
In order to solve this problem, we propose the implementation of the Status Teller Network, a
DApp inside Status, which provides borderless, peer-to-peer fiat-to-crypto ‘Teller Network’.
The Teller Network allows Stakeholders in the Network to find nearby users to exchange their
cash for digital assets and currency, giving any smartphone owner in the world the ability to
take control of their personal wealth.
In this sense, Status becomes a piece of a “Web 3.0” banking infrastructure and creates a
global people-as-ATM network. This has particular utility in developing markets where cashbased economies are prevalent and credit card penetration remains low, tackling the famous
‘last-mile’ of the remittance market.
The growing trade volumes observed on LocalBitcoins, ~30M USD per week
(CoinDance 2017), coupled with the rise of remittance startups built on legacy systems like
TransferWise (Crunchbase 2017), serve as a testament to the viability of this model.*"


In short, Teller is a dapp that crypto asset owners can publish offers to sell them and buyers can find those offers and in a secure manner, trade FIAT for those assets. In case of a dispute, a chosen arbitrator steps in and resolve the issue.

* [Teller Network Dapp (Rinkeby)](https://status-im.github.io/status-teller-network/build/)

## Installation

- `yarn install`

## Usage

### Development
1. `embark run` (optional `--nodashboard`)
2. `yarn start` (starts create-react-app pipeline)

### Testnet (Rinkeby)

1. Create a file `./.secret.json` with the following content
```js
{
  "infuraKey": "your_infura_key"
  "mnemonic": "12 words mnemonic"
}
```
2. `embark run testnet` (optional `--nodashboard`)
3. `yarn start` (starts create-react-app pipeline)

It's recommended to execute `embark reset` when switching environments.

*Warning*
Running on testnet will not deploy the contracts. In case you want to deploy the contracts yourself, follow these steps:

1. Edit `./embarkConfig/contracts.js,`. There is a list of constants that must be set with proper values for the ownership of the contracts, fallback arbitrators and gas price for deployment.

2. Execute these commands:
```bash
rm ./shared.rinkeby.json
embark reset
embark run testnet
```

### Mainnet
Just like with testnets, a `.secret.json` file is required and setting up the constants in the contract configuration file. Contracts require to be deployed since **we do not provide a mainnet configuration**. 


## Deployment of the DApp
```
embark run testnet
yarn build
```

The content of the DApp will be available in `./build`


### Adding funds to gas relayer.
Teller uses the Gas Station Network contracts provided by [Tabookey](https://www.npmjs.com/package/tabookey-gasless). To run a relay, please follow the instructions found on that link or in their [Github repository](https://github.com/opengsn/gsn#readme)

To send funds to the gas relayer using Embark, the following instruction must be executed in the Embark Console or in the Cockpit:
```js
RelayHub.methods.depositFor(EscrowRelay.options.address).send({from: web3.eth.defaultAccount, value: web3.utils.toWei("0.1", "ether")});
```

## Contact
If you have any questions or queries the whole team is on Status on the `#teller` public chat group which can be opened here on Status mobile: https://get.status.im/chat/public/teller . We are also available on Gitter and Discord.

## Contribution
Thank you for considering to help out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to Teller, please send a pull request for the maintainers to review and merge into the main code base. Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/status-im/status-teller-network/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
1. Fork the status-im/status-teller-network repo.
1. Make your changes in a new git branch:

```shell
git checkout -b my-fix-branch master
```

1. Create your patch, **including appropriate test cases**.
1. Run the QA suite, by running `$ embark test` and ensure that all steps succeed.
1. Commit your changes using a descriptive commit message.

```shell
git commit -a
```
Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

1. Push your branch to GitHub:

```shell
git push origin my-fix-branch
```

1. In GitHub, send a pull request to `master`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the test suites to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

```shell
git push origin --delete my-fix-branch
```

* Check out the master branch:

```shell
git checkout master -f
```

* Delete the local branch:

```shell
git branch -D my-fix-branch
```

* Update your master with the latest upstream version:

```shell
git pull --ff upstream master
```
