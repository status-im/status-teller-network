import {SET_CONTACT, SET_OFFER_ID, SET_TRADE} from './constants';

// TODO get ENS address when we do code the saga for buyer
export const setContact = ({nickname, contactCode}) => ({type: SET_CONTACT, nickname, contactCode});

export const setOffer = (offerId) => ({type: SET_OFFER_ID, offerId});

export const setTrade = ({fiatQty, assetQty}) => ({type: SET_TRADE, fiatQty, assetQty});
