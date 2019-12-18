import Escrow from '../embarkArtifacts/contracts/Escrow';
import EscrowRelay from '../embarkArtifacts/contracts/EscrowRelay';
import EscrowProxy from '../embarkArtifacts/contracts/EscrowProxy';
import MetadataStore from '../embarkArtifacts/contracts/MetadataStore';
import MetadataStoreProxy from '../embarkArtifacts/contracts/MetadataStoreProxy';
import SNT from '../embarkArtifacts/contracts/SNT';
import {checkNotEnoughETH} from './utils/transaction';
import {addressCompare, zeroAddress} from './utils/address';
import {canRelay} from './features/escrow/helpers';

Escrow.options.address = EscrowProxy.options.address;
MetadataStore.options.address = MetadataStoreProxy.options.address;

const VALID_OPERATIONS = {
  "cancel(uint256)": "40e58ee5",
  "createEscrow(uint256,uint256,uint256,string,string,string)":"56a9480a",
  "openCase(uint256,uint8)": "267b4cc3",
  "pay(uint256)": "c290d691",
  "rateTransaction(uint256,uint256)":"79347b06"
};

class Provider {
  constructor(relayProvider) {
    this.relayProvider = relayProvider;
    this.relayProviderSend = (this.relayProvider['sendAsync'] || this.relayProvider['send']).bind(this.relayProvider);
  }

  async isEthOrSNT(web3, data){
    if(!data || data.length < 74) return false;
    const offerId = web3.utils.hexToNumber(data.substr(10, 64));
    const offer = await MetadataStore.methods.offers(offerId).call();
    return addressCompare(offer.asset, SNT.options.address) || addressCompare(offer.asset, zeroAddress);    
  }

  startProvider(web3) {
    this.origProvider = web3.currentProvider;
    this.origProviderSend = (this.origProvider['sendAsync'] || this.origProvider['send']).bind(this.origProvider);
    
    const fSend = (payload, callback) => {
      if(!payload.params || payload.params.length === 0) return this.origProviderSend(payload, callback);

      const params = payload.params[0];
      const operation = params && params.data ? params.data.substring(2, 10) : "0x";

      if (!(params && params.to && addressCompare(params.to, Escrow.options.address) &&
        payload.method === "eth_sendTransaction" &&
        Object.values(VALID_OPERATIONS).includes(operation))) {
        this.origProviderSend(payload, callback);
        return;
      }

      (async () => {
        const balance = await web3.eth.getBalance(web3.eth.defaultAccount);
        const gasPrice = await web3.eth.getGasPrice();

        if (checkNotEnoughETH(gasPrice, balance) || operation === VALID_OPERATIONS["rateTransaction(uint256,uint256)"]) {

          if(operation === VALID_OPERATIONS["createEscrow(uint256,uint256,uint256,string,string,string)"]){
            const isEthOrSNT = await this.isEthOrSNT(web3, payload.params[0].data);
            const lastActivity = await EscrowRelay.methods.lastActivity(web3.eth.defaultAccount).call();
            if(!isEthOrSNT || !canRelay(parseInt(lastActivity + '000', 10))) {
              this.origProviderSend(payload, callback);
              return;
            }
          }

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
