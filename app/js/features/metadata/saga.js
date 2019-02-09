import MetadataStore from 'Embark/contracts/MetadataStore';
import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  LOAD, LOAD_SELLER, LOAD_SELLER_FAILED, LOAD_SELLER_SUCCEEDED, LOAD_OFFERS_SUCCEEDED, LOAD_OFFERS_FAILED, LOAD_OFFERS
} from './constants';

export function *loadSeller({address}) {
  try {
    const size = yield MetadataStore.methods.sellersSize().call();
    if (size === '0'){
      return;
    }
    const id = yield MetadataStore.methods.addressToSeller(address).call();
    const seller = yield MetadataStore.methods.sellers(id).call();
    yield put({type: LOAD_SELLER_SUCCEEDED, seller: seller, address: address});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_SELLER_FAILED, error: error.message});
  }
}

export function *onLoadSeller() {
  yield takeEvery(LOAD_SELLER, loadSeller);
}

export function *loadOffers({address}) {
  
  try {
    const offerIds = yield MetadataStore.methods.getOfferIds(address).call();
    const offers = yield all(offerIds.map((id) => MetadataStore.methods.sellers(id).call()));
    yield put({type: LOAD_OFFERS_SUCCEEDED, offers: offers, address: address});
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
    put({type: LOAD_SELLER, address}),
    put({type: LOAD_OFFERS, address})
  ]);
}

export function *onLoad() {
  yield takeEvery(LOAD, load);
}

export default [fork(onLoad), fork(onLoadSeller), fork(onLoadOffers)];
