import { fork, take, takeEvery, call, put, actionChannel, select } from 'redux-saga/effects';
import cc from 'cryptocompare';
import { FETCH_PRICES, FETCH_PRICES_SUCCEEDED, FETCH_PRICES_FAILED, PRICE_INTERVAL } from './constants';
import network from "../../features/network";


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
  const requestChan = yield actionChannel(PRICE_INTERVAL);
  while (true) {
    yield take(requestChan);
    let tokens = yield select(network.selectors.getTokens); // <-- get the project

    const symbols = Object.keys(tokens);
    const fiat = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW']; // TODO: where will this list come from?

    try {
      const data = yield call(cc.priceMulti, symbols, fiat);
      yield put({type: FETCH_PRICES_SUCCEEDED, data});
    } catch (error) {
      yield put({type: FETCH_PRICES_FAILED, error});
    }
  }
}

export default [fork(onFetchPrices), fork(fetchAllTokenPrices)];
