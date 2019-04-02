import { FETCH_PRICES, FETCH_EXCHANGE_RATE } from './constants';

export const fetchPrices = payload => ({ type: FETCH_PRICES, payload });

export const fetchExchangeRates = () => ({type: FETCH_EXCHANGE_RATE});
