import { fork, take, takeEvery, call, put, actionChannel, select } from 'redux-saga/effects';
import cc from 'cryptocompare';
import { FETCH_PRICES, FETCH_PRICES_SUCCEEDED, FETCH_PRICES_FAILED, FETCH_EXCHANGE_RATE } from './constants';
import network from "../../features/network";
import merge from 'merge';
import {CURRENCY_DATA} from "../../utils/currencies";

export function *doFetchPrices(action) {
  try {
    const { payload: { from, to } } = action;
    const data = yield call(cc.priceMulti, from, to);
    yield put({type: FETCH_PRICES_SUCCEEDED, data});
  } catch (error) {
    yield put({type: FETCH_PRICES_FAILED, error});
  }
}

export function *onFetchPrices() {
  yield takeEvery(FETCH_PRICES, doFetchPrices);
}


function *fetchAllTokenPrices() {
  const requestChan = yield actionChannel(FETCH_EXCHANGE_RATE);
  while (true) {
    yield take(requestChan);
    let tokens = yield select(network.selectors.getTokens); // <-- get the project
    
    const symbols = Object.keys(tokens);
    let data = {};
    
    try {
      const size = 20;
      for (let i = 0; i < CURRENCY_DATA.length; i += size) { // Query 20 currencies at a time
        const fiat = CURRENCY_DATA.slice(i, i + size).map(x => x.id);
        const prices = yield call(cc.priceMulti, symbols, fiat);
        data = merge.recursive(true, prices, data);
      }
      yield put({type: FETCH_PRICES_SUCCEEDED, data});
    } catch (error) {
      yield put({type: FETCH_PRICES_FAILED, error});
    }
  }
}

export default [fork(onFetchPrices), fork(fetchAllTokenPrices)];
