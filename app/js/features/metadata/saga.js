import MetadataStore from 'Embark/contracts/MetadataStore';
import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  LOAD, LOAD_USER, LOAD_USER_FAILED, LOAD_USER_SUCCEEDED,
  LOAD_OFFERS_SUCCEEDED, LOAD_OFFERS_FAILED, LOAD_OFFERS, ADD_OFFER,
  ADD_OFFER_FAILED, ADD_OFFER_SUCCEEDED, ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER, UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED,
  LOAD_USER_LOCATION, LOAD_USER_LOCATION_SUCCEEDED
} from './constants';
import {doTransaction} from '../../utils/saga';
import {getEnsAddress} from '../../services/embarkjs';
import {getLocation} from '../../services/googleMap';


export function *loadUser({address}) {
  try {
    const isUser = yield MetadataStore.methods.userWhitelist(address).call();
    if (!isUser){
      return;
    }
    const id = yield MetadataStore.methods.addressToUser(address).call();
    const user = yield MetadataStore.methods.users(id).call();

    yield put({type: LOAD_USER_LOCATION, user, address});
    yield put({type: LOAD_USER_SUCCEEDED, user, address});
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

    const offers = yield all(offerIds.map(function *(id) {
      const offer = yield MetadataStore.methods.offer(id).call();
      yield put({type: LOAD_USER, address: offer.owner});
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
  try {
    user.statusContactCode = yield getEnsAddress(user.statusContactCode);
  } catch (error) {
    yield put({type: ADD_OFFER_FAILED, error});
    return;
  }
  const toSend = MetadataStore.methods.addOffer(
    offer.asset,
    user.statusContactCode,
    user.location,
    offer.currency,
    user.username,
    offer.paymentMethods,
    offer.marketType,
    offer.margin
  );
  yield doTransaction(ADD_OFFER_PRE_SUCCESS, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, {user, offer, toSend});
}

export function *onAddOffer() {
  yield takeEvery(ADD_OFFER, addOffer);
}

export function *updateUser({user}) {
  user.statusContactCode = yield getEnsAddress(user.statusContactCode);

  const toSend = MetadataStore.methods.updateUser(
    user.statusContactCode,
    user.location,
    user.username
  );
  yield doTransaction(UPDATE_USER_PRE_SUCCESS, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, {toSend, user});
}

export function *onUpdateUser() {
  yield takeEvery(UPDATE_USER, updateUser);
}

export default [
  fork(onLoad),
  fork(onLoadUser),
  fork(onLoadLocation),
  fork(onLoadOffers),
  fork(onAddOffer),
  fork(onUpdateUser)
];
