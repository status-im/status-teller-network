/* global web3 */
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';

import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  LOAD, LOAD_USER, LOAD_USER_FAILED, LOAD_USER_SUCCEEDED,
  LOAD_OFFERS_SUCCEEDED, LOAD_OFFERS_FAILED, LOAD_OFFERS, ADD_OFFER,
  ADD_OFFER_FAILED, ADD_OFFER_SUCCEEDED, ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER, UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED,
  LOAD_USER_LOCATION, LOAD_USER_LOCATION_SUCCEEDED, LOAD_USER_TRADE_NUMBER_SUCCEEDED,
  SIGN_MESSAGE, SIGN_MESSAGE_FAILED, SIGN_MESSAGE_SUCCEEDED
} from './constants';
import {USER_RATING, LOAD_ESCROWS} from '../escrow/constants';
import {doTransaction} from '../../utils/saga';
import {getLocation} from '../../services/googleMap';

export function *loadUser({address}) {
  try {
    const isArbitrator = yield ArbitrationLicense.methods.isLicenseOwner(address).call();
    const isUser = yield MetadataStore.methods.userWhitelist(address).call();

    let user = {
      isArbitrator
    };

    if (!isUser){
      if(isArbitrator) {
        yield put({type: LOAD_USER_SUCCEEDED, user, address});
      }
      return;
    }

    const id = yield MetadataStore.methods.addressToUser(address).call();
    user = Object.assign(user, yield MetadataStore.methods.users(id).call());

    if (user.location) {
      yield put({type: LOAD_USER_LOCATION, user, address});
    }
    yield put({type: USER_RATING, address});
    yield put({type: LOAD_USER_SUCCEEDED, user, address});
    yield put({type: LOAD_ESCROWS, address});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_USER_FAILED, error: error.message});
  }
}

export function *onLoadUser() {
  yield takeEvery(LOAD_USER, loadUser);
}

export function *loadLocation({user, address}) {
  try {
    const coords = yield getLocation(user.location);
    yield put({type: LOAD_USER_LOCATION_SUCCEEDED, user, address, coords});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_USER_FAILED, error: error.message});
  }
}

export function *onLoadLocation() {
  yield takeEvery(LOAD_USER_LOCATION, loadLocation);
}

export function *loadOffers({address}) {
  try {
    let offerIds = [];

    if (address) {
      offerIds = yield MetadataStore.methods.getOfferIds(address).call();
    } else {
      const size = yield MetadataStore.methods.offersSize().call();
      offerIds = Array.apply(null, {length: size}).map(Number.call, Number);
    }
    const loadedUsers = [];

    let allReleased;
    let releasedEscrows;
    if (!address) {
      allReleased = yield Escrow.getPastEvents('Released', {fromBlock: 1});
      releasedEscrows = allReleased.map(e => e.returnValues.escrowId);
    }

    const offers = yield all(offerIds.map(function *(id) {
      const offer = yield MetadataStore.methods.offer(id).call();

      if (!loadedUsers.includes(offer.owner)) {
        loadedUsers.push(offer.owner);
        yield put({type: LOAD_USER, address: offer.owner});
      }

      if (address) {
        // return now as we only have the data of a few offers so we can't calculate the nb of trades
        return {...offer, id};
      }

      // Get all escrows of that offer
      const createdTrades = yield Escrow.getPastEvents('Created', {filter: {offerId: id}, fromBlock: 1});
      let nbReleasedTrades = 0;
      createdTrades.forEach(tradeEvent => {
        if (releasedEscrows.includes(tradeEvent.returnValues.escrowId)) {
          nbReleasedTrades++;
        }
      });

      yield put({
        type: LOAD_USER_TRADE_NUMBER_SUCCEEDED,
        address: offer.owner,
        nbReleasedTrades: nbReleasedTrades,
        nbCreatedTrades: createdTrades.length
      });

      return {...offer, id};
    }));

    yield put({type: LOAD_OFFERS_SUCCEEDED, offers});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_OFFERS_FAILED, error: error.message});
  }
}

export function *onLoadOffers() {
  yield takeEvery(LOAD_OFFERS, loadOffers);
}

export function *load({address}) {
  yield all([
    put({type: LOAD_USER, address}),
    put({type: LOAD_OFFERS, address})
  ]);
}

export function *onLoad() {
  yield takeEvery(LOAD, load);
}

export function *addOffer({user, offer}) {
  const toSend = MetadataStore.methods.addOffer(
    offer.asset,
    user.statusContactCode,
    user.location,
    offer.currency,
    user.username,
    offer.paymentMethods,
    offer.margin,
    offer.arbitrator
  );
  yield doTransaction(ADD_OFFER_PRE_SUCCESS, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, {user, offer, toSend});
}

export function *onAddOffer() {
  yield takeEvery(ADD_OFFER, addOffer);
}

export function *updateUser({user}) {
  const toSend = MetadataStore.methods['addOrUpdateUser(bytes,string,string)'](
    user.statusContactCode,
    user.location,
    user.username
  );
  yield doTransaction(UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, {toSend, user});
}

export function *onUpdateUser() {
  yield takeEvery(UPDATE_USER, updateUser);
}

export function *signMessage({statusContactCode, username}) {
  try {
    const hash = yield MetadataStore.methods.getDataHash(username, statusContactCode).call({from: web3.eth.defaultAccount});
    const signature = yield web3.eth.personal.sign(hash, web3.eth.defaultAccount);
    const nonce = yield MetadataStore.methods.user_nonce(web3.eth.defaultAccount).call();

    yield put({type: SIGN_MESSAGE_SUCCEEDED, signature, nonce});
  } catch(err){
    yield put({type: SIGN_MESSAGE_FAILED, error: err.message});
  }
}

export function *onSignMessage() {
  yield takeEvery(SIGN_MESSAGE, signMessage);
}


export default [
  fork(onLoad),
  fork(onLoadUser),
  fork(onLoadLocation),
  fork(onLoadOffers),
  fork(onAddOffer),
  fork(onUpdateUser),
  fork(onSignMessage)
];
