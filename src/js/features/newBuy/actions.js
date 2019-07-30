import {SET_CONTACT_INFO, SET_TRADE, SET_OFFER_ID, RESET_NEW_BUY} from './constants';

export const setOfferId = (offerId) => ({type: SET_OFFER_ID, offerId});
export const setContactInfo = ({username, statusContactCode}) => ({type: SET_CONTACT_INFO, username, statusContactCode});
export const setTrade = (currencyQuantity, assetQuantity, price) => ({type: SET_TRADE, currencyQuantity, assetQuantity, price});
export const resetNewBuy = () => ({type: RESET_NEW_BUY});
