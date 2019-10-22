/*global web3*/

import ERC20Token from '../../../embarkArtifacts/contracts/ERC20Token';
import Resolver from '../../../embarkArtifacts/contracts/Resolver';
import ethNameHash from 'eth-ens-namehash';
import { fork, takeEvery, call, put, all, select } from 'redux-saga/effects';
import {
  INIT, INIT_FAILED, INIT_SUCCEEDED,
  UPDATE_BALANCES, UPDATE_BALANCE, UPDATE_BALANCE_FAILED, UPDATE_BALANCE_SUCCEEDED,
  GET_CONTACT_CODE, GET_CONTACT_CODE_SUCCEEDED, GET_CONTACT_CODE_FAILED, RESOLVE_ENS_NAME, RESOLVE_ENS_NAME_FAILED, RESOLVE_ENS_NAME_SUCCEEDED, GET_GAS_PRICE, GET_GAS_PRICE_FAILED, GET_GAS_PRICE_SUCCEEDED
} from './constants';
import {FETCH_EXCHANGE_RATE} from '../prices/constants';
import { onReady } from '../../services/embarkjs';
import { zeroAddress, zeroBytes } from '../../utils/address';

export function *doInit() {
  try {
    yield call(onReady);
    const networkId = yield call(web3.eth.net.getId);

    yield all([
      put({type: INIT_SUCCEEDED, networkId}),
      put({type: GET_GAS_PRICE}),
      put({type: FETCH_EXCHANGE_RATE})
    ]);
  } catch (error) {
    console.error(error);
    yield put({type: INIT_FAILED, error: error.message});
  }
}

export function *onInit() {
  yield takeEvery(INIT, doInit);
}

export function *updateBalance({symbol, address}) {
  if (!address) {
    address = yield select((state) => state.network.address);
  }
  const token = yield select((state) => state.network.tokens[symbol]);
  let value;
  try {
    if (!token) {
      yield put({type: UPDATE_BALANCE_FAILED, error: "token doesn't exist in this network"});
      return;
    } else if (token.address === zeroAddress) {
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

export function *updateBalances({address}) {
  const symbols = yield select((state) => Object.keys(state.network.tokens));
  yield all(symbols.map(symbol => (
    put({type: UPDATE_BALANCE, symbol, address})
  )));
}

export function *onUpdateBalances() {
  yield takeEvery(UPDATE_BALANCES, updateBalances);
}

export function *getGasPrice() {
  try {
    const gasPrice = yield web3.eth.getGasPrice();
    yield put({type: GET_GAS_PRICE_SUCCEEDED, gasPrice});
  } catch(error){
    console.error(error);
    yield put({type: GET_GAS_PRICE_FAILED});
  }
}

export function *onGetGasPrice() {
  yield takeEvery(GET_GAS_PRICE, getGasPrice);
}

export function *getStatusCode() {
  try {
    // https://status.im/developer_tools/status_web_api.html
    const contactCode = yield web3.currentProvider.status.getContactCode();
    yield put({type: GET_CONTACT_CODE_SUCCEEDED, contactCode});
  } catch (error) {
    console.error(error);
    yield put({type: GET_CONTACT_CODE_FAILED, error: error.message});
  }
}

export function *onGetStatusCode() {
  yield takeEvery(GET_CONTACT_CODE, getStatusCode);
}

export function *resolveEnsName({ens}) {
  try {
    const hash = ethNameHash.hash(ens);
    const value = yield Resolver.methods.pubkey(hash).call();

    if(value.x === zeroBytes || value.y === zeroBytes){
      yield put({type: RESOLVE_ENS_NAME_FAILED, error: "Couldn't resolve ENS name"});
    } else {
      const contactCode = "0x04" + value.x.substring(2) + value.y.substring(2);
      yield put({type: RESOLVE_ENS_NAME_SUCCEEDED, contactCode});
    }
  } catch(error) {
    yield put({type: RESOLVE_ENS_NAME_FAILED, error: "Couldn't resolve ENS name"});
    console.error(error);
  }
}

export function *onResolveEnsName() {
  yield takeEvery(RESOLVE_ENS_NAME, resolveEnsName);
}


export default [
  fork(onInit),
  fork(onUpdateBalances),
  fork(onUpdateBalance),
  fork(onGetStatusCode),
  fork(onGetGasPrice),
  fork(onResolveEnsName)
];
