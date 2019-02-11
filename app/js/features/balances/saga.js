import SNT from 'Embark/contracts/SNT';
import {fork, takeEvery, put} from 'redux-saga/effects';
import {
  LOAD_SNT_BALANCE_SUCCEEDED, LOAD_SNT_BALANCE_FAILED, LOAD_SNT_BALANCE
} from './constants';

export function *loadSNTBalance({address}) {
  try {
    const value = yield SNT.methods.balanceOf(address).call();
    yield put({type: LOAD_SNT_BALANCE_SUCCEEDED, value: value, address: address});
  } catch (error) {
    console.error(error);
    yield put({type: LOAD_SNT_BALANCE_FAILED, error: error.message});
  }
}

export function *onLoadSNTBalance() {
  yield takeEvery(LOAD_SNT_BALANCE, loadSNTBalance);
}

export default [fork(onLoadSNTBalance)];
