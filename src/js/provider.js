import EscrowRelay from '../embarkArtifacts/contracts/EscrowRelay';
import {checkNotEnoughETH} from './utils/transaction';

const VALID_OPERATIONS = {
  "cancel()": "ea8a1af0",
  "create(uint256,uint256,uint8,uint256,bytes,string,string,uint256,bytes)": "b22bd55a",
  "openCase(string)": "5cc80c53",
  "pay()": "1b9265b8"
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

      if (!(payload.method === "eth_sendTransaction" &&
        Object.values(VALID_OPERATIONS).includes(params.data.substring(2, 10)))) {
        this.origProviderSend(payload, callback);
        return;
      }

      (async () => {
        const balance = await web3.eth.getBalance(web3.eth.defaultAccount);
        const gasPrice = await web3.eth.getGasPrice();
        
        if (checkNotEnoughETH(gasPrice, balance)) {
          // Increase 120%.
          // Normally we would use gaspriceFactorPercent on tabookey.RelayProvider
          // but this version of web3 does a getPrice before send() if the gas price is null
          // to set this gas price as a parameter. Tabookey will then use this value directly
          // without applying the factor percent
          const useGasPrice = web3.utils.toBN(gasPrice).mul(web3.utils.toBN("120")).div(web3.utils.toBN("100"));
          const original_to = payload.params[0].to;
          const funcSignature = payload.params[0].data.substring(0, 10);

          payload.params[0].gasPrice = web3.utils.toHex(useGasPrice);
          payload.params[0].to = EscrowRelay.options.address;
          payload.params[0].gas = web3.utils.fromDecimal(web3.utils.toDecimal(payload.params[0].gas) + 100000);

          switch(funcSignature) {
            case "0x1b9265b8": // pay()
              payload.params[0].data = "0x0c11dedd000000000000000000000000" + original_to.substring(2); // pay(address);
              break;
            case "0xea8a1af0": // cancel()
              payload.params[0].data = "0x4c33fe94000000000000000000000000" + original_to.substring(2); // cancel(address);
              break;
            case "0x5cc80c53": // openCase(string)
              payload.params[0].data = "0xef37f1b6000000000000000000000000" + original_to.substring(2) + payload.params[0].data.substring(10); // openCase(address,string)
              break;
            default:
          }

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
