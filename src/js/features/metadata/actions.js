import {
  LOAD, ADD_OFFER, RESET_ADD_OFFER_STATUS, SET_CURRENT_USER,
  UPDATE_USER, RESET_UPDATE_USER_STATUS, LOAD_OFFERS, LOAD_USER,
  SIGN_MESSAGE, DELETE_OFFER, ENABLE_ETHEREUM, SET_MAINNET_WARNING_SHOWED,
  GET_OFFER_PRICE
} from './constants';
import MetadataStore from '../../../embarkArtifacts/contracts/MetadataStore';
import MetadataStoreProxy from '../../../embarkArtifacts/contracts/MetadataStoreProxy';

MetadataStore.options.address = MetadataStoreProxy.options.address;

export const load = (address) => ({type: LOAD, address});
export const loadUserOnly = (address) => ({type: LOAD_USER, address});
export const loadOffers = (address) => ({ type: LOAD_OFFERS, address });

export const addOffer = (seller, offerStake) => ({
  type: ADD_OFFER,
  user: {
    statusContactCode: seller.statusContactCode,
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
    limitU: seller.useCustomLimits ? seller.limitU.toFixed(2).toString().replace('.', '') : 0,
    stake: offerStake
  }
});

export const getOfferPrice = () => ({type: GET_OFFER_PRICE});

export const signMessage = (username, statusContactCode) => ({
  type: SIGN_MESSAGE,
  statusContactCode,
  username
});

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

export const resetUpdateUserStatus = () => ({
  type: RESET_UPDATE_USER_STATUS
});

export const deleteOffer = (offerId) => ({
  type: DELETE_OFFER,
  offerId,
  toSend: MetadataStore.methods.removeOffer(offerId)
});
