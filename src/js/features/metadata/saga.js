/* global web3 */
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import SellerLicense from '../../../embarkArtifacts/contracts/SellerLicense';
import Escrow from '../../../embarkArtifacts/contracts/Escrow';
import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  LOAD, LOAD_USER, LOAD_USER_FAILED, LOAD_USER_SUCCEEDED,
  LOAD_OFFERS_SUCCEEDED, LOAD_OFFERS_FAILED, LOAD_OFFERS, ADD_OFFER,
  ADD_OFFER_FAILED, ADD_OFFER_SUCCEEDED, ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER, UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED,
  LOAD_USER_LOCATION, LOAD_USER_LOCATION_SUCCEEDED, LOAD_USER_TRADE_NUMBER_SUCCEEDED,
  SIGN_MESSAGE, SIGN_MESSAGE_FAILED, SIGN_MESSAGE_SUCCEEDED,
  DELETE_OFFER, DELETE_OFFER_FAILED, DELETE_OFFER_PRE_SUCCESS, DELETE_OFFER_SUCCEEDED,
  ENABLE_ETHEREUM, ENABLE_ETHEREUM_FAILED, ENABLE_ETHEREUM_SUCCEEDED
} from './constants';
import {USER_RATING, LOAD_ESCROWS} from '../escrow/constants';
import {doTransaction} from '../../utils/saga';
import {getLocation} from '../../services/googleMap';
import EscrowProxy from '../../../embarkArtifacts/contracts/EscrowProxy';
import { zeroAddress, addressCompare, zeroBytes, keyFromXY, generateXY } from '../../utils/address';
import SellerLicenseProxy from '../../../embarkArtifacts/contracts/SellerLicenseProxy';
import ArbitrationLicenseProxy from '../../../embarkArtifacts/contracts/ArbitrationLicenseProxy';
import MetadataStoreProxy from '../../../embarkArtifacts/contracts/MetadataStoreProxy';
import {enableEthereum} from '../../services/embarkjs';

MetadataStore.options.address = MetadataStoreProxy.options.address;
ArbitrationLicense.options.address = ArbitrationLicenseProxy.options.address;
SellerLicense.options.address = SellerLicenseProxy.options.address;
Escrow.options.address = EscrowProxy.options.address;

export function *loadUser({address}) {
  try {
    const isArbitrator = yield ArbitrationLicense.methods.isLicenseOwner(address).call();
    const isSeller = yield SellerLicense.methods.isLicenseOwner(address).call();

    let userLicenses = {
      isArbitrator,
      isSeller
    };

    const user = Object.assign(userLicenses, yield MetadataStore.methods.users(address).call());
    user.statusContactCode = keyFromXY(user.pubkeyA, user.pubkeyB);

    if(user.pubkeyA === zeroBytes && user.pubkeyB === zeroBytes){
      if(isArbitrator || isSeller) {
        yield put({type: LOAD_USER_SUCCEEDED, user: userLicenses, address});
      }
      return;
    }


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
    const {location: coords, countryCode} = yield getLocation(user.location);
    yield put({type: LOAD_USER_LOCATION_SUCCEEDED, user, address, coords, countryCode});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_USER_FAILED, error: error.message});
  }
}

export function *onLoadLocation() {
  yield takeEvery(LOAD_USER_LOCATION, loadLocation);
}

export function *enabledEthereum() {
  try {
    const accounts = yield enableEthereum();
    yield put({type: LOAD_USER, address: accounts[0]});
    yield put({type: ENABLE_ETHEREUM_SUCCEEDED, accounts});
  } catch (error) {
    yield put({type: ENABLE_ETHEREUM_FAILED, error: error.message});
  }
}

export function *onEnabledEthereum() {
  yield takeEvery(ENABLE_ETHEREUM, enabledEthereum);
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

      if(!addressCompare(offer.arbitrator, zeroAddress)){
        offer.arbitratorData = yield MetadataStore.methods.users(offer.arbitrator).call();
        offer.arbitratorData.statusContactCode = keyFromXY(offer.arbitratorData.pubkeyA, offer.arbitratorData.pubkeyB);
      }

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
  const coords = generateXY(user.statusContactCode);

  const toSend = MetadataStore.methods.addOffer(
    offer.asset,
    coords.x,
    coords.y,
    user.location,
    offer.currency,
    user.username,
    offer.paymentMethods,
    offer.limitL,
    offer.limitU,
    offer.margin,
    offer.arbitrator
  );
  yield doTransaction(ADD_OFFER_PRE_SUCCESS, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, {user, offer, toSend});
}

export function *onAddOffer() {
  yield takeEvery(ADD_OFFER, addOffer);
}

export function *updateUser({user}) {
  const coords = generateXY(user.statusContactCode);
  const toSend = MetadataStore.methods['addOrUpdateUser(bytes32,bytes32,string,string)'](
    coords.x,
    coords.y,
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
    const coords = generateXY(statusContactCode);
    const hash = yield MetadataStore.methods.getDataHash(username, coords.x, coords.y).call({from: web3.eth.defaultAccount});
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

export function *onDeleteOffer() {
  yield takeEvery(DELETE_OFFER, doTransaction.bind(null, DELETE_OFFER_PRE_SUCCESS, DELETE_OFFER_SUCCEEDED, DELETE_OFFER_FAILED));
}


export default [
  fork(onLoad),
  fork(onLoadUser),
  fork(onLoadLocation),
  fork(onLoadOffers),
  fork(onAddOffer),
  fork(onUpdateUser),
  fork(onSignMessage),
  fork(onDeleteOffer),
  fork(onEnabledEthereum)
];
