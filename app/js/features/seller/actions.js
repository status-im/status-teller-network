import { SET_FIAT, SET_MARGIN, SET_SELECTED_ASSET, SET_LOCATION } from './constants';

export const setFiatCurrency = (fiat) => ({ type: SET_FIAT, fiat });

export const setSelectedAsset = (selectedAsset) => ({ type: SET_SELECTED_ASSET, selectedAsset });

export const setLocation = (location) => ({ type: SET_LOCATION, location });

export const setMarginRate = ({rate, isAbove}) => ({ type: SET_MARGIN, rate, isAbove });
