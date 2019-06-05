/*global web3*/
import EmbarkJS from '../../embarkArtifacts/embarkjs';
import {contactCodeRegExp} from '../utils/address';
import TellerProvider from '../provider';
import tabookey from 'tabookey-gasless';

export function onReady() {
  return new Promise((resolve, reject) => {
    EmbarkJS.onReady((err) => {
      if (err) {
        return reject(err);
      }

      // A relay gets compensated whenever it relays a transaction: whatever the gas usage it pays, 
      // it gets back the same plus the "txFee" precent - that is, it gets back ( (txFee+100)*gasUsed ) / 100
      const relayProvider = new tabookey.RelayProvider(web3.currentProvider, { txfee: 12 });
      const customProvider = new TellerProvider(web3.currentProvider, relayProvider);
      web3.setProvider(customProvider);

      resolve();
    });
  });
}

export function getEnsAddress(name) {
  return new Promise(async (resolve, reject) => {
    try {
      // TODO check if an address is not correct and we only want contact codes, we need to validate that ENS returns a contact code
      if (contactCodeRegExp.test(name) || web3.utils.isAddress(name)) {
        return resolve(name);
      }
      if (name.indexOf('.') === -1) {
        name += '.stateofus.eth';
      }
      const address = await EmbarkJS.Names.resolve(name);
      resolve(address);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}
