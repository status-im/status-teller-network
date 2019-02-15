/*global web3*/

import { fork, takeEvery, call, put } from 'redux-saga/effects';
import { 
  EMBARKJS_INIT, EMBARKJS_INIT_FAILED, EMBARKJS_INIT_SUCCEEDED
} from './constants';
import { onReady } from '../../services/embarkjs';

export function *doInit() {
  try {
    yield call(onReady);
    const networkId = yield call(web3.eth.net.getId);
    yield put({type: EMBARKJS_INIT_SUCCEEDED, networkId});
  } catch (error) {
    yield put({type: EMBARKJS_INIT_FAILED, error});
  }
}

export function *onInit() {
  yield takeEvery(EMBARKJS_INIT, doInit);
}

export default [fork(onInit)];
