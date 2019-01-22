/*global web3*/
import License from 'Embark/contracts/License';
import SNT from 'Embark/contracts/SNT';
import Escrow from 'Embark/contracts/Escrow';

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import {
  ADD_USER_RATING,
  BUY_LICENSE, BUY_LICENSE_FAILED, BUY_LICENSE_SUCCEEDED,
  CHECK_LICENSE_OWNER, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER_SUCCEEDED,
  USER_RATING, USER_RATING_FAILED, USER_RATING_SUCCEEDED, GET_LICENSE_OWNERS, GET_LICENSE_OWNERS_SUCCCEDED,
  GET_LICENSE_OWNERS_FAILED
} from './constants';

export function *doBuyLicense() {
  try {
    const price = yield call(License.methods.getPrice().call);
    const balance = yield call(SNT.methods.balanceOf(web3.eth.defaultAccount).call);
    if (balance < price) {
      throw new Error(`Insufficient funds to buy a License. You need to have at least ${price} SNT, but you have ${balance}`);
    }
    const encodedCall = License.methods.buy().encodeABI();
    const toSend = SNT.methods.approveAndCall(License.options.address, price, encodedCall);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000});
    yield put({type: BUY_LICENSE_SUCCEEDED});
  } catch (error) {
    console.error(error);
    yield put({type: BUY_LICENSE_FAILED, error: error.message});
  }
}

export function *onBuyLicense() {
  yield takeEvery(BUY_LICENSE, doBuyLicense);
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

export default [fork(onBuyLicense), fork(onCheckLicenseOwner), fork(onUserRating), fork(onAddUserRating), fork(onGetLicenseOwners)];
