/*global web3*/

import License from 'Embark/contracts/License';
import SNT from 'Embark/contracts/SNT';

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import { 
  BUY_LICENSE, BUY_LICENSE_FAILED, BUY_LICENSE_SUCCEEDED,
  CHECK_LICENSE_OWNER, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER_SUCCEEDED
} from './constants';

export function *doBuyLicense() {
  try {
    const price = yield call(License.methods.getPrice().call);
    const encodedCall = License.methods.buy().encodeABI();
    const toSend = SNT.methods.approveAndCall(License.options.address, price, encodedCall);
    const estimatedGas = yield call(toSend.estimateGas);
    yield call(toSend.send, {gasLimit: estimatedGas + 1000});
    yield put({type: BUY_LICENSE_SUCCEEDED});
  } catch (error) {
    yield put({type: BUY_LICENSE_FAILED, error});
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
    yield put({type: CHECK_LICENSE_OWNER_FAILED, error});
  }
}

export function *onCheckLicenseOwner() {
  yield takeEvery(CHECK_LICENSE_OWNER, doCheckLicenseOwner);
}

export default [fork(onBuyLicense), fork(onCheckLicenseOwner)];
