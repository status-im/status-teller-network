/*global web3*/
import License from 'Embark/contracts/License';
import SNT from 'Embark/contracts/SNT';
import Escrow from 'Embark/contracts/Escrow';

window.SNT = SNT;

import {fork, takeEvery, call, put, take} from 'redux-saga/effects';
import {
  ADD_USER_RATING,
  BUY_LICENSE, BUY_LICENSE_FAILED, BUY_LICENSE_SUCCEEDED, BUY_LICENSE_PRE_SUCCESS,
  CHECK_LICENSE_OWNER, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER_SUCCEEDED,
  USER_RATING, USER_RATING_FAILED, USER_RATING_SUCCEEDED, GET_LICENSE_OWNERS, GET_LICENSE_OWNERS_SUCCCEDED,
  GET_LICENSE_OWNERS_FAILED,
  LOAD_PRICE,
  LOAD_PRICE_SUCCEEDED,
  LOAD_PRICE_FAILED
} from './constants';
import {promiseEventEmitter} from '../../utils/saga';
import {eventChannel} from "redux-saga";

export function *doBuyLicense() {
  try {
    const price = yield call(License.methods.getPrice().call);
    const encodedCall = License.methods.buy().encodeABI();
    const toSend = SNT.methods.approveAndCall(License.options.address, price, encodedCall);
    const estimatedGas = yield call(toSend.estimateGas);
    const promiseEvent = toSend.send({gasLimit: estimatedGas + 1000});
    const channel = eventChannel(promiseEventEmitter.bind(null, promiseEvent));
    while (true) {
      const {hash, receipt, error} = yield take(channel);
      if (hash) {
        yield put({type: BUY_LICENSE_PRE_SUCCESS, txHash: hash});
      } else if (receipt) {
        yield put({type: BUY_LICENSE_SUCCEEDED});
      } else if (error) {
        throw error;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    yield put({type: BUY_LICENSE_FAILED, error: error.message});
  }
}

export function *onBuyLicense() {
  yield takeEvery(BUY_LICENSE, doBuyLicense);
}

export function *loadPrice() {
  try {
    const price = yield call(License.methods.getPrice().call);
    yield put({type: LOAD_PRICE_SUCCEEDED, price});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_PRICE_FAILED, error: error.message});
  }
}

export function *onLoadPrice() {
  yield takeEvery(LOAD_PRICE, loadPrice);
}

export function *doCheckLicenseOwner() {
  try {
    const isLicenseOwner = yield call(License.methods.isLicenseOwner(web3.eth.defaultAccount).call);
    yield put({type: CHECK_LICENSE_OWNER_SUCCEEDED, isLicenseOwner});
  } catch (error) {
    console.error(error);
    yield put({type: CHECK_LICENSE_OWNER_FAILED, error: error.message});
  }
}

export function *onCheckLicenseOwner() {
  yield takeEvery(CHECK_LICENSE_OWNER, doCheckLicenseOwner);
}

export function *doGetLicenseOwners() {
  try {
    // TODO get more information like position and rate
    const events = yield License.getPastEvents('Bought', {fromBlock: 1});
    const licenseOwners = events.map(event => {
      return {address: event.returnValues.buyer};
    });
    yield put({type: GET_LICENSE_OWNERS_SUCCCEDED, licenseOwners});
  } catch (error) {
    console.error(error);
    yield put({type: GET_LICENSE_OWNERS_FAILED, error: error.message});
  }
}

export function *onGetLicenseOwners() {
  yield takeEvery(GET_LICENSE_OWNERS, doGetLicenseOwners);
}

export function *checkUserRating() {
  try {
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
    const events = yield Escrow.getPastEvents('Rating', {fromBlock: 1, filter: {seller: web3.eth.defaultAccount}});
    const ratings = events.slice(events.length - 5).map((e) => parseInt(e.returnValues.rating, 10));
    const averageRating = arrAvg(ratings);

    yield put({type: USER_RATING_SUCCEEDED, userRating: averageRating});
  } catch (error) {
    console.error(error);
    yield put({type: USER_RATING_FAILED, error: error.message});
  }
}
export function *onUserRating() {
  yield takeEvery(USER_RATING, checkUserRating);
}

export async function *addRating() {
  try {
    //rate_transaction(uint _escrowId, uint _rate)
  } catch (error) {
    console.error(error);
    yield put({type: USER_RATING_FAILED, error: error.message});
  }
}

export function *onAddUserRating() {
  yield takeEvery(ADD_USER_RATING, addRating);
}

export default [
  fork(onBuyLicense),
  fork(onLoadPrice),
  fork(onCheckLicenseOwner),
  fork(onUserRating), 
  fork(onAddUserRating),
  fork(onGetLicenseOwners)
];
