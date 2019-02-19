import MetadataStore from 'Embark/contracts/MetadataStore';
import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  LOAD, LOAD_USER, LOAD_USER_FAILED, LOAD_USER_SUCCEEDED,
  LOAD_OFFERS_SUCCEEDED, LOAD_OFFERS_FAILED, LOAD_OFFERS, ADD_OFFER,
  ADD_OFFER_FAILED, ADD_OFFER_SUCCEEDED, ADD_OFFER_PRE_SUCCESS, UPDATE_USER, UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED
} from './constants';

import {doTransaction} from '../../utils/saga';

export function *loadUser({address}) {
  try {
    const size = yield MetadataStore.methods.usersSize().call();
    if (size === '0'){
      return;
    }
    const id = yield MetadataStore.methods.addressToUser(address).call();
    const user = yield MetadataStore.methods.users(id).call();
    yield put({type: LOAD_USER_SUCCEEDED, user, address});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_USER_FAILED, error: error.message});
  }
}

export function *onLoadUser() {
  yield takeEvery(LOAD_USER, loadUser);
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

    const offers = yield all(offerIds.map((id) => MetadataStore.methods.offer(id).call()));
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

export function *onAddOffer() {
  yield takeEvery(ADD_OFFER, doTransaction.bind(null, ADD_OFFER_PRE_SUCCESS, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED));
}

export function *onUpdateUser() {
  yield takeEvery(UPDATE_USER, doTransaction.bind(null, UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED));
}

export default [
  fork(onLoad), 
  fork(onLoadUser), 
  fork(onLoadOffers), 
  fork(onAddOffer),
  fork(onUpdateUser)
];
