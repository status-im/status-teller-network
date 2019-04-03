import {SET_CONTACT_INFO, SET_TRADE, SET_OFFER_ID} from './constants';

export const setOfferId = (offerId) => ({type: SET_OFFER_ID, offerId});
export const setContactInfo = ({username, statusContactCode}) => ({type: SET_CONTACT_INFO, username, statusContactCode});
export const setTrade = ({currencyQuantity, assetQuantity}) => ({type: SET_TRADE, currencyQuantity, assetQuantity});
