import { FETCH_PRICES, PRICE_INTERVAL } from './constants';

export const fetchPrices = payload => ({ type: FETCH_PRICES, payload });

export const priceInterval = () => ({type: PRICE_INTERVAL});
