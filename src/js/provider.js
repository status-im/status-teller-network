/* global web3 */
import Escrow from '../embarkArtifacts/contracts/Escrow';
import EscrowRelay from '../embarkArtifacts/contracts/EscrowRelay';
import EscrowProxy from '../embarkArtifacts/contracts/EscrowProxy';
import OfferStore from '../embarkArtifacts/contracts/OfferStore';
import OfferStoreProxy from '../embarkArtifacts/contracts/OfferStoreProxy';
import SNT from '../embarkArtifacts/contracts/SNT';
import {checkNotEnoughETH} from './utils/transaction';
import {addressCompare, zeroAddress} from './utils/address';
import {canRelay} from './features/escrow/helpers';
import stripHexPrefix from 'strip-hex-prefix';

Escrow.options.address = EscrowProxy.options.address;
OfferStore.options.address = OfferStoreProxy.options.address;

const CREATE_ESCROW = "createEscrow(uint256,uint256,uint256,address,string,string,string)";
const RATE_TRANSACTION = "rateTransaction(uint256,uint256)";
const CANCEL_ESCROW = "cancel(uint256)";
const OPEN_CASE = "openCase(uint256,uint8)";
const PAY_ESCROW = "pay(uint256)";

const VALID_OPERATIONS = [CREATE_ESCROW, CANCEL_ESCROW, OPEN_CASE, PAY_ESCROW, RATE_TRANSACTION]
  .map(x => ({[x]: stripHexPrefix(web3.utils.soliditySha3(x)).substring(0, 8)}))
  .reduce((curr, accum) => Object.assign(curr, accum), {});

export async function shouldUseRelay(data, to, method) {
  const operation = data ? data.substring(2, 10) : "0x";

  if (!(to && addressCompare(to, Escrow.options.address) &&
    method === "eth_sendTransaction" &&
    Object.values(VALID_OPERATIONS).includes(operation))) {
    return false;
  }

  const balance = await web3.eth.getBalance(web3.eth.defaultAccount);
  const gasPrice = await web3.eth.getGasPrice();
  const gsnBalance = await web3.eth.getBalance(EscrowRelay.options.address);

  // Relay doesn't have enough balance
  if (checkNotEnoughETH(gasPrice, gsnBalance)) {
    return false;
  }

  if (!checkNotEnoughETH(gasPrice, balance) && operation !== VALID_OPERATIONS[RATE_TRANSACTION]) {
    return false;
  }

  if (operation === VALID_OPERATIONS[CREATE_ESCROW]) {
    const isEthOrSNT = await this.isEthOrSNT(web3, data);
    const lastActivity = await EscrowRelay.methods.lastActivity(web3.eth.defaultAccount).call();
    if (!isEthOrSNT || !canRelay(parseInt(lastActivity + '000', 10))) {
      // Possible spam
      return false;
    }
  }

  return true;
}

class Provider {
  constructor(relayProvider) {
    this.relayProvider = relayProvider;
    this.relayProviderSend = (this.relayProvider['sendAsync'] || this.relayProvider['send']).bind(this.relayProvider);
  }

  async isEthOrSNT(web3, data) {
    if (!data || data.length < 74) return false;
    const offerId = web3.utils.hexToNumber('0x' + data.substr(10, 64));
    const offer = await OfferStore.methods.offers(offerId).call();
    return addressCompare(offer.asset, SNT.options.address) || addressCompare(offer.asset, zeroAddress);
  }

  startProvider(web3) {
    this.origProvider = web3.currentProvider;
    this.origProviderSend = (this.origProvider['sendAsync'] || this.origProvider['send']).bind(this.origProvider);

    const fSend = async (payload, callback) => {
      (async () => {
        if (!payload.params || payload.params.length === 0 ||
          await shouldUseRelay(payload.params[0].data, payload.params[0].to, payload.method) === false) {
          return this.origProviderSend(payload, callback);
        }

        payload.params[0].to = EscrowRelay.options.address;
        payload.params[0].gas = web3.utils.fromDecimal(web3.utils.toDecimal(payload.params[0].gas) + 100000);

        this.relayProviderSend(payload, (error, result) => {
          callback(error, result);
        });
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
