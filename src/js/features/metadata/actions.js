import {
  LOAD, ADD_OFFER, RESET_ADD_OFFER_STATUS, SET_CURRENT_USER,
  UPDATE_USER, RESET_UPDATE_USER_STATUS, LOAD_OFFERS, LOAD_USER,
  DELETE_OFFER, ENABLE_ETHEREUM, SET_MAINNET_WARNING_SHOWED,
  GET_OFFER_PRICE, CHECK_ACCOUNT_CHANGE, RESET_PROVIDER_VERIFICATION, GET_MAX_OFFERS
} from './constants';
import OfferStoreInstance from '../../../embarkArtifacts/contracts/OfferStoreInstance';

export const load = (address) => ({type: LOAD, address});
export const loadUserOnly = (address) => ({type: LOAD_USER, address});
export const loadOffers = (address) => ({ type: LOAD_OFFERS, address });

export const addOffer = (seller) => ({
  type: ADD_OFFER,
  user: {
    contactData: seller.contactData,
    location: seller.location,
    username: seller.username
  },
  offer: {
    asset: seller.asset,
    currency: seller.currency,
    paymentMethods: seller.paymentMethods,
    margin: seller.margin,
    arbitrator: seller.arbitrator,
    limitL: seller.useCustomLimits ? seller.limitL.toFixed(2).toString().replace('.', '') : 0,
    limitU: seller.useCustomLimits ? seller.limitU.toFixed(2).toString().replace('.', '') : 0
  }
});

export const getOfferPrice = () => ({type: GET_OFFER_PRICE});

export const getMaxOffers = () => ({type: GET_MAX_OFFERS});

export const setCurrentUser = (currentUser) => ({
  type: SET_CURRENT_USER,
  currentUser
});

export const resetAddOfferStatus = () => ({
  type: RESET_ADD_OFFER_STATUS
});

export const enableEthereum = () => ({
  type: ENABLE_ETHEREUM
});

export const setMainnetWarningShowed = () => ({
  type: SET_MAINNET_WARNING_SHOWED
});

export const updateUser = (user) => ({
  type: UPDATE_USER,
  user
});

export const checkAccountChange = () => ({
  type: CHECK_ACCOUNT_CHANGE
});

export const resetUpdateUserStatus = () => ({
  type: RESET_UPDATE_USER_STATUS
});

export const deleteOffer = (offerId) => ({
  type: DELETE_OFFER,
  offerId,
  toSend: OfferStoreInstance.methods.removeOffer(offerId)
});

export const resetProviderVerification = () => ({
  type: RESET_PROVIDER_VERIFICATION
});
