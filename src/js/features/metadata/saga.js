/* global web3 */
import ArbitrationLicense from '../../../embarkArtifacts/contracts/ArbitrationLicense';
import EscrowInstance from '../../../embarkArtifacts/contracts/EscrowInstance';
import OfferStoreInstance from '../../../embarkArtifacts/contracts/OfferStoreInstance';
import UserStoreInstance from '../../../embarkArtifacts/contracts/UserStoreInstance';
import SellerLicenseInstance from '../../../embarkArtifacts/contracts/SellerLicenseInstance';
import {eventChannel} from 'redux-saga';
import {fork, takeEvery, put, all, call, select, take} from 'redux-saga/effects';
import {
  LOAD,
  LOAD_USER,
  LOAD_USER_FAILED,
  LOAD_USER_SUCCEEDED,
  LOAD_OFFERS_SUCCEEDED,
  LOAD_OFFERS_FAILED,
  LOAD_OFFERS,
  ADD_OFFER,
  ADD_OFFER_FAILED,
  ADD_OFFER_SUCCEEDED,
  ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER,
  UPDATE_USER_PRE_SUCCESS,
  UPDATE_USER_SUCCEEDED,
  UPDATE_USER_FAILED,
  LOAD_USER_LOCATION,
  LOAD_USER_LOCATION_SUCCEEDED,
  LOAD_USER_TRADE_NUMBER_SUCCEEDED,
  DELETE_OFFER,
  DELETE_OFFER_FAILED,
  DELETE_OFFER_PRE_SUCCESS,
  DELETE_OFFER_SUCCEEDED,
  ENABLE_ETHEREUM,
  ENABLE_ETHEREUM_FAILED,
  ENABLE_ETHEREUM_SUCCEEDED,
  GET_OFFER_PRICE,
  GET_OFFER_PRICE_SUCCEEDED,
  GET_OFFER_PRICE_FAILED,
  SET_CURRENT_USER,
  CHECK_ACCOUNT_CHANGE,
  GET_MAX_OFFERS,
  GET_MAX_OFFERS_SUCCEEDED,
  GET_MAX_OFFERS_FAILED
} from './constants';
import {USER_RATING, LOAD_ESCROWS} from '../escrow/constants';
import {doTransaction} from '../../utils/saga';
import {getLocation} from '../../services/googleMap';
import { zeroAddress, addressCompare } from '../../utils/address';
import {getContactData} from '../../utils/strings';
import ArbitrationLicenseProxy from '../../../embarkArtifacts/contracts/ArbitrationLicenseProxy';
import {enableEthereum} from '../../services/embarkjs';
import network from '../../features/network';

ArbitrationLicense.options.address = ArbitrationLicenseProxy.options.address;

export function *loadUser({address}) {
  if(!address) return;

  const defaultAccount = web3.eth.defaultAccount || zeroAddress;

  try {
    const isArbitrator = yield ArbitrationLicense.methods.isLicenseOwner(address).call({from: defaultAccount});
    const isSeller = yield SellerLicenseInstance.methods.isLicenseOwner(address).call({from: defaultAccount});

    let userLicenses = {
      isArbitrator,
      isSeller
    };

    const user = Object.assign(userLicenses, yield UserStoreInstance.methods.users(address).call({from: defaultAccount}));

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

function countdown(_expiration) {
  return eventChannel(emitter => {
      const iv = setInterval(() => {
        emitter(1);
      }, 1000);
      // The subscriber must return an unsubscribe function
      return () => {
        clearInterval(iv);
      };
    }
  );
}

export function *verifyAccountChange() {
  const chan = yield call(countdown, 99);
  let currAddress = yield select((state) => state.network.address);
  try {
    while (true) {
      yield take(chan);
      if (!currAddress) {
        currAddress = yield select((state) => state.network.address);
      }
      const accounts = yield web3.eth.getAccounts();
      if (currAddress && (!accounts.length || !addressCompare(web3.eth.defaultAccount, currAddress))) {
        yield put(network.actions.clearCache(
          setTimeout(() => {
            window.location.reload();
          }, 500)
        ));
      }
    }
  } catch (e) {
    console.error('Error getting accounts', e);
  } finally {
    // Interval terminated, not much to do here
  }
}

export function *enabledEthereum() {
  try {
    let accounts = yield enableEthereum();
    if (!accounts) {
      accounts = yield web3.eth.getAccounts();
    }
    if (accounts) {
      web3.eth.defaultAccount = accounts[0];
      yield put({type: LOAD_USER, address: accounts[0]});
      yield put({type: SET_CURRENT_USER, currentUser: accounts[0]});
    }
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

    const defaultAccount = web3.eth.defaultAccount || zeroAddress;
    if (address) {
      offerIds = yield OfferStoreInstance.methods.getOfferIds(address).call({from: defaultAccount});
    } else {
      const size = yield OfferStoreInstance.methods.offersSize().call({from: defaultAccount});
      offerIds = Array.apply(null, {length: size}).map(Number.call, Number);
    }
    const loadedUsers = [];

    let allReleased;
    let releasedEscrows;
    if (!address) {
      allReleased = yield EscrowInstance.getPastEvents('Released', {fromBlock: 1});
      releasedEscrows = allReleased.map(e => e.returnValues.escrowId);
    }

    const nbReleasedTradesObject = {};
    const nbCreatedTradesObject = {};

    const offers = yield all(offerIds.map(function *(id) {
      const offer = yield OfferStoreInstance.methods.offer(id).call({from: defaultAccount});

      if(!addressCompare(offer.arbitrator, zeroAddress)){
        offer.arbitratorData = yield UserStoreInstance.methods.users(offer.arbitrator).call({from: defaultAccount});
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
      const createdTrades = yield EscrowInstance.getPastEvents('Created', {filter: {offerId: id}, fromBlock: 1});
      let nbReleasedTrades = 0;
      createdTrades.forEach(tradeEvent => {
        if (releasedEscrows.includes(tradeEvent.returnValues.escrowId)) {
          nbReleasedTrades++;
        }
      });

      if (nbReleasedTradesObject[offer.owner] === undefined) {
        nbReleasedTradesObject[offer.owner] = 0;
        nbCreatedTradesObject[offer.owner] = 0;

      }
      nbReleasedTradesObject[offer.owner] += nbReleasedTrades;
      nbCreatedTradesObject[offer.owner] += createdTrades.length;

      return {...offer, id};
    }));


    // Put nb trades for all users after aggregating them
    yield all(Object.keys(nbReleasedTradesObject).map(function *(owner) {
      yield put({
        type: LOAD_USER_TRADE_NUMBER_SUCCEEDED,
        address: owner,
        nbReleasedTrades: nbReleasedTradesObject[owner],
        nbCreatedTrades: nbCreatedTradesObject[owner]
      });
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
  const price = yield call(getOfferPrice);
  const priceInEther = parseFloat(web3.utils.fromWei(price, "ether")) * 1.05; // 5% for price variations while mining
  const valueInWei = web3.utils.toWei(priceInEther.toString());

  const toSend = OfferStoreInstance.methods.addOffer(
    offer.asset,
    user.contactData,
    user.location,
    offer.currency,
    user.username,
    offer.paymentMethods,
    offer.limitL,
    offer.limitU,
    offer.margin,
    offer.arbitrator
  );
  yield doTransaction(ADD_OFFER_PRE_SUCCESS, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, {
    user,
    offer: Object.assign(offer, {limitH: offer.limitU}),
    toSend,
    value: valueInWei
  });
}

export function *onAddOffer() {
  yield takeEvery(ADD_OFFER, addOffer);
}

export function *updateUser({user}) {
  const toSend = UserStoreInstance.methods['addOrUpdateUser(string,string,string)'](
    getContactData(user.contactMethod, user.contactData),
    user.location,
    user.username
  );
  yield doTransaction(UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, {toSend, user});
}

export function *onUpdateUser() {
  yield takeEvery(UPDATE_USER, updateUser);
}

export function *onDeleteOffer() {
  yield takeEvery(DELETE_OFFER, doTransaction.bind(null, DELETE_OFFER_PRE_SUCCESS, DELETE_OFFER_SUCCEEDED, DELETE_OFFER_FAILED));
}

export function *getOfferPrice() {
  try {
    const price = yield OfferStoreInstance.methods.getAmountToStake(web3.eth.defaultAccount).call();
    yield put({type: GET_OFFER_PRICE_SUCCEEDED, price});
    return price;
  } catch(err){
    yield put({type: GET_OFFER_PRICE_FAILED, error: err.message});
  }
}

export function *getMaxOffers() {
  try {
    const maxOffers = yield OfferStoreInstance.methods.maxOffers().call();
    yield put({type: GET_MAX_OFFERS_SUCCEEDED, maxOffers});
  } catch(err){
    yield put({type: GET_MAX_OFFERS_FAILED, error: err.message});
  }
}

export function *onGetMaxOffers() {
  yield takeEvery(GET_MAX_OFFERS, getMaxOffers);
}

export function *onGetOfferPrice() {
  yield takeEvery(GET_OFFER_PRICE, getOfferPrice);
}

export function *onAccountChange() {
  yield takeEvery(CHECK_ACCOUNT_CHANGE, verifyAccountChange);
}

export default [
  fork(onLoad),
  fork(onLoadUser),
  fork(onLoadLocation),
  fork(onLoadOffers),
  fork(onAddOffer),
  fork(onUpdateUser),
  fork(onDeleteOffer),
  fork(onEnabledEthereum),
  fork(onGetOfferPrice),
  fork(onAccountChange),
  fork(onGetMaxOffers)
];
