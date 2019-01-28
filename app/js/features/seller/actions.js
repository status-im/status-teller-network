import { SET_FIAT, SET_MARGIN } from './constants';

export const setFiatCurrency = (fiat) => ({ type: SET_FIAT, fiat });

export const setMarginRate = (rate, isAbove) => ({ type: SET_MARGIN, rate, isAbove });
