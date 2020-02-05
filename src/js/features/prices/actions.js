import { FETCH_EXCHANGE_RATE, LOAD_PRICE_FOR_ASSET_AND_CURRENCY } from './constants';

export const fetchExchangeRates = () => ({type: FETCH_EXCHANGE_RATE});

export const loadPriceForAssetAndCurrency = (asset, currency) => ({type: LOAD_PRICE_FOR_ASSET_AND_CURRENCY, asset, currency});
