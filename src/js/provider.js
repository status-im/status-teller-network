import Escrow from '../embarkArtifacts/contracts/Escrow';
import EscrowRelay from '../embarkArtifacts/contracts/EscrowRelay';
import EscrowProxy from '../embarkArtifacts/contracts/EscrowProxy';

import {checkNotEnoughETH} from './utils/transaction';
import {addressCompare} from './utils/address';

Escrow.options.address = EscrowProxy.options.address;

const VALID_OPERATIONS = {
  "cancel(uint256)": "40e58ee5",
  "createEscrow(uint256,uint256,uint256,bytes32,bytes32,string,string,uint256,bytes)": "69186778",
  "openCase(uint256,string)": "58b67904",
  "pay(uint256)": "c290d691"
};

class Provider {
  constructor(relayProvider) {
    this.relayProvider = relayProvider;
    this.relayProviderSend = (this.relayProvider['sendAsync'] || this.relayProvider['send']).bind(this.relayProvider);
  }

  startProvider(web3) {
    this.origProvider = web3.currentProvider;
    this.origProviderSend = (this.origProvider['sendAsync'] || this.origProvider['send']).bind(this.origProvider);
    
    const fSend = (payload, callback) => {
      const params = payload.params[0];

      if (!(params && params.to && addressCompare(params.to, Escrow.options.address) &&
        payload.method === "eth_sendTransaction" &&
        Object.values(VALID_OPERATIONS).includes(params.data.substring(2, 10)))) {
        this.origProviderSend(payload, callback);
        return;
      }

      (async () => {
        const balance = await web3.eth.getBalance(web3.eth.defaultAccount);
        const gasPrice = await web3.eth.getGasPrice();
        if (checkNotEnoughETH(gasPrice, balance)) {
          payload.params[0].to = EscrowRelay.options.address;
          payload.params[0].gas = web3.utils.fromDecimal(web3.utils.toDecimal(payload.params[0].gas) + 100000);
          
          this.relayProviderSend(payload, (error, result) => {
            callback(error, result);
          });
        } else {
          this.origProviderSend(payload, callback);
        }
      })();
    };
    
    this.origProvider.send = fSend;
    this.origProvider.sendAsync = fSend;
  }

  sendAsync(payload, callback) {
    return this.send(payload, callback);
  }
}

export default Provider;
