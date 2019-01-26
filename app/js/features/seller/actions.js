import { SET_FIAT, SET_TOKEN } from './constants';

export const setFiatCurrency = (fiat) => ({ type: SET_FIAT, fiat });

export const setToken = (token, rate) => ({ type: SET_TOKEN, token, rate });
