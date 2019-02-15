/*global web3*/

import ERC20Token from 'Embark/contracts/ERC20Token';
import {fork, takeEvery, put, all} from 'redux-saga/effects';
import {
  UPDATE_BALANCES, UPDATE_BALANCE, UPDATE_BALANCE_FAILED, UPDATE_BALANCE_SUCCEEDED
} from './constants';
import { zeroAddress } from '../../utils/address';

export function *updateBalance({token, address}) {
  try {
    let value;
    if (token.address === zeroAddress) {
      value = yield web3.eth.getBalance(address);
    } else {
      const contract = new web3.eth.Contract(ERC20Token._jsonInterface, token.address);
      value = yield contract.methods.balanceOf(address).call();
    }
    yield put({type: UPDATE_BALANCE_SUCCEEDED, value, token, address});
  } catch (error) {
    console.error(error);
    yield put({type: UPDATE_BALANCE_FAILED, error: error.message});
  }
}

export function *onUpdateBalance() {
  yield takeEvery(UPDATE_BALANCE, updateBalance);
}

export function *updateBalances({tokens, address}) {
  yield all(tokens.map(token => (
    put({type: UPDATE_BALANCE, token, address})
  )));
}

export function *onUpdateBalances() {
  yield takeEvery(UPDATE_BALANCES, updateBalances);
}

export default [fork(onUpdateBalances), fork(onUpdateBalance)];
