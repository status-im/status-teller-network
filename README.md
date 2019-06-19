[![Build Status](https://travis-ci.org/status-im/status-teller-network.svg?branch=master)](https://travis-ci.org/status-im/status-teller-network) [![Join the chat at https://gitter.im/status-im/status-teller-network](https://badges.gitter.im/status-im/status-teller-network.svg)](https://gitter.im/status-im/status-teller-network?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# status-teller-network

## Installation

- `yarn install`

## Running

1. `embark run` (optional `--nodashboard`)
2. `yarn start` (starts create-react-app pipeline)

## Running Tabookey Gas Relayer (no docker. For docker, see their README)

1. Clone v3.0.0 of tabookey-gasless
```
git clone https://github.com/tabookey/tabookey-gasless
cd tabookey-gasless
git checkout 2316c7422d50ac0242f8442f6dc98d0c85512c13
npm install
npm test
```

2. Run the server. (Embark must be running, and it should have deployed the RelayHub contract)
```
./build/server/bin/RelayHttpServer -RelayHubAddress RELAY_HUB_CONTRACT_ADDRESS_HERE -Workdir ./build/server --EthereumNodeUrl http://localhost:8555
```
Replace the RelayHub contract address for the correct address.

3. Browse http://localhost:8090/getaddr. Copy the address

4. Stake ether for that address. You can execute this in the embark console:
```
RelayHub.methods.stake(RELAYER_ADDRESS_GOES_HERE, 30).send({value: web3.utils.toWei("1", "ether"), gas:800000}) 
```

5. Send some ether to the relayer
```
web3.eth.sendTransaction({from: web3.eth.defaultAccount, to: RELAYER_ADDRESS_GOES_HERE, value: web3.utils.toWei("3", "ether")})
```

6. Relayer should register itself now that there's a stake. Otherwise restart the server

## Deploying

1. `embark build testnet`
2. `yarn run build`

* [StoryBook](https://status-im.github.io/status-teller-network/storybook/)
* [Teller Network Dapp (Rinkeby)](https://status-im.github.io/status-teller-network/build/)
