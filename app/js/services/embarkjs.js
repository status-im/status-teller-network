/*global web3*/
import EmbarkJS from 'Embark/EmbarkJS';

export function onReady() {
  return new Promise((resolve, reject) => {
    EmbarkJS.onReady((err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

export function getEnsAddress(name) {
  return new Promise(async (resolve, reject) => {
    try {
      if (web3.utils.isAddress(name)) {
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
