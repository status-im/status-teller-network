import {SET_CURENCY, SET_MARGIN, SET_ASSET, SET_LOCATION, SET_PAYMENT_METHODS, SET_CONTACT_INFO} from './constants';

export const setAsset = (asset) => ({type: SET_ASSET, asset});
export const setLocation = (location) => ({type: SET_LOCATION, location});
export const setPaymentMethods = (paymentMethods) => ({type: SET_PAYMENT_METHODS, paymentMethods});
export const setCurrency = (currency) => ({type: SET_CURENCY, currency});
export const setMargin = (margin, marketType) => ({type: SET_MARGIN, marketType, margin});
export const setContactInfo = ({username, statusContactCode}) => ({type: SET_CONTACT_INFO, username, statusContactCode});