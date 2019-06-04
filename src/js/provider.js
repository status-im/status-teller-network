/* global web3 */
import Escrow from '../embarkArtifacts/contracts/Escrow';
import {checkNotEnoughETH} from './utils/transaction';
import {addressCompare} from './utils/address';

const VALID_OPERATIONS = {
  "cancel(uint256)": "40e58ee5",
  "create(address,uint256,uint256,uint8,uint256,bytes,string,string)": "a63c5162",
  "openCase(uint256,string)": "58b67904",
  "pay(uint256)": "c290d691"
};

class Provider {
    constructor(origProvider, relayProvider) {
        this.origProvider = origProvider;
        this.relayProvider = relayProvider;
        this.origProviderSend = (this.origProvider['sendAsync'] || this.origProvider['send']).bind(this.origProvider);
        this.relayProviderSend = (this.relayProvider['sendAsync'] || this.relayProvider['send']).bind(this.relayProvider);
    }

    send(payload, callback) {
      const params = payload.params[0];
      if(params && params.to && addressCompare(params.to, Escrow.options.address.toLowerCase())){
        if(payload.method === "eth_sendTransaction" && Object.values(VALID_OPERATIONS).includes(params.data.substring(2, 10))){
          (async () => {
            const balance = await web3.eth.getBalance(web3.eth.defaultAccount);
            const gasPrice = await web3.eth.getGasPrice();
            if(checkNotEnoughETH(gasPrice, balance)){
              // Increase 120%. 
              // Normally we would use gaspriceFactorPercent on tabookey.RelayProvider
              // but this version of web3 does a getPrice before send() if the gas price is null
              // to set this gas price as a parameter. Tabookey will then use this value directly
              // without applying the factor percent
              const useGasPrice = web3.utils.toBN(gasPrice).mul(web3.utils.toBN("120")).div(web3.utils.toBN("100"));
              payload.params[0].gasPrice = web3.utils.toHex(useGasPrice);
              this.relayProviderSend(payload, function (error, result) {
                callback(error, result);
              });
            } else {
              this.origProviderSend(payload, callback);
            }
          })();
          return;
        }
      }

      this.origProviderSend(payload, callback);
    }

    sendAsync(payload, callback) {
        return this.send(payload, callback);
    }
}

export default Provider;
