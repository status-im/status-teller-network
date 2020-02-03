import {fork, call, put, select, takeEvery} from 'redux-saga/effects';
import cc from 'cryptocompare';
import {
  FETCH_PRICES_SUCCEEDED,
  FETCH_PRICES_FAILED,
  FETCH_EXCHANGE_RATE,
  SAVE_COIN_GECKO_IDS,
  FETCH_EXCHANGE_RATE_FALLBACK,
  LOAD_PRICE_FOR_ASSET_AND_CURRENCY
} from './constants';
import {getGeckoIds} from "./selectors";
import merge from 'merge';
import {CURRENCY_DATA} from "../../constants/currencies";
import axios from 'axios';
import network from "../../features/network";
import {Tokens} from "../../utils/networks";

const COIN_GECKO_API_ENDPOINT = 'https://api.coingecko.com/api/v3';
const COIN_GECKO_API_LIST = `${COIN_GECKO_API_ENDPOINT}/coins/list`;
const COIN_GECKO_API_PING = COIN_GECKO_API_ENDPOINT + '/ping';
const COIN_GECKO_API_MARKETS = COIN_GECKO_API_ENDPOINT + '/coins/markets';

function symbolBinarySearch(arr, symbolToFind, nameToCompare) {
  let min = 0,
    max = arr.length - 1,
    guess, symbol, name;

  while (min <= max) {
    guess = Math.floor((min + max) / 2);
    symbol = arr[guess].symbol.toUpperCase();
    name = arr[guess].id.toUpperCase();

    if (symbol === symbolToFind) {
      return arr[guess];
    }
    if (name.includes('-')) {
      name = name.replace(/-/g, '');
    }
    if (name < nameToCompare) {
      min = guess + 1;
    } else {
      max = guess - 1;
    }
  }

  return false;
}

function *fetchAllTokenPricesFallback({asset, currency: curr}) {
  try {
    let symbols;
    if (asset && curr) {
      symbols = [asset];
    } else {
      let tokens = yield select(network.selectors.getTokens); // <-- get the project
      symbols = Object.keys(tokens);
    }

    const currencies = (asset && curr) ? [{id: curr}] : CURRENCY_DATA;

    let data = {};
    const size = 20;

    for (let i = 0; i < currencies.length; i += size) { // Query 20 currencies at a time
      const fiat = currencies.slice(i, i + size).map(x => x.id);
      const prices = yield call(cc.priceMulti, symbols, fiat);
      data = merge.recursive(true, prices, data);
      yield put({type: FETCH_PRICES_SUCCEEDED, data});
    }
  } catch (error) {
    console.error(error);
    yield put({type: FETCH_PRICES_FAILED, error: error.message});
  }
}


export function *onFetchPricesFallback() {
  yield takeEvery(FETCH_EXCHANGE_RATE_FALLBACK, fetchAllTokenPricesFallback);
}

function *fetchAllTokenPrices({asset, currency: curr}) {
  let data = {};

  try {
    const ping = yield call(axios.get, COIN_GECKO_API_PING);
    if (!ping || ping.status !== 200) {
      console.warn('Coin Gecko API seems down. Trying Crypto Compare');
      return yield put({type: FETCH_EXCHANGE_RATE_FALLBACK, asset, currency: curr});
    }

    try {
      let coinGeckoIds = yield select(getGeckoIds);

      if (!coinGeckoIds || Object.keys(coinGeckoIds).length === 0) {
        // Get the coin IDs
        const allCoins = yield call(axios.get, COIN_GECKO_API_LIST);

        const tokens = Tokens.mainnet;
        coinGeckoIds = {};
        tokens.forEach(token => {
          const result = symbolBinarySearch(allCoins.data, token.symbol.toUpperCase(), token.name.toUpperCase().replace(/ /g, ''));

          if (!result) {
            console.warn('No Info for token', token.symbol);
          } else {
            coinGeckoIds[result.id] = token.symbol;
          }
        });
        yield put({type: SAVE_COIN_GECKO_IDS, coinGeckoIds});
      }
      let id;
      if (asset && curr) {
        id = Object.keys(coinGeckoIds).find(key => coinGeckoIds[key] === asset);
      }
      const keys = asset && curr ? [id] : Object.keys(coinGeckoIds);
      const ids = keys.join(',');
      let currency;
      const currencies = (asset && curr) ? [{id: curr}] : CURRENCY_DATA;

      for (let i = 0; i < currencies.length; i++) {
        currency = currencies[i].id;
        const response = yield call(axios.get, `${COIN_GECKO_API_MARKETS}?vs_currency=${currency.toLowerCase()}&ids=${ids}&order=market_cap_desc&per_page=${keys.length}&sparkline=false`);
        if (response.status !== 200) {
          console.error('Error getting price data for', currency, response.data || response.error);
          continue;
        }
        // eslint-disable-next-line no-loop-func
        response.data.forEach(coinMarkerInfo => {
          const id = coinMarkerInfo.id;
          if (!data[coinGeckoIds[id]]) {
            data[coinGeckoIds[id]] = {};
          }
          data[coinGeckoIds[id]][currency] = coinMarkerInfo.current_price;
        });
        yield put({type: FETCH_PRICES_SUCCEEDED, data});
      }
    } catch (e) {
      console.error('Error with Coingecko', e);
      console.error('Fallbacking to other market API');
      yield put({type: FETCH_EXCHANGE_RATE_FALLBACK, asset, currency: curr});
    }
  } catch (error) {
    console.error(error);
    return yield put({type: FETCH_PRICES_FAILED, error: error.message});
  }
}

export function *onFetchPrices() {
  yield takeEvery(FETCH_EXCHANGE_RATE, fetchAllTokenPrices);
}

export function *onLoadPriceForAsset() {
  yield takeEvery(LOAD_PRICE_FOR_ASSET_AND_CURRENCY, fetchAllTokenPrices);
}

export default [fork(onFetchPrices), fork(onFetchPricesFallback), fork(onLoadPriceForAsset)];
