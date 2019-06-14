import {
  LOAD, ADD_OFFER, RESET_ADD_OFFER_STATUS, SET_CURRENT_USER,
  UPDATE_USER, RESET_UPDATE_USER_STATUS, LOAD_OFFERS, LOAD_USER,
  SIGN_MESSAGE
} from './constants';

export const load = (address) => ({type: LOAD, address});
export const loadUserOnly = (address) => ({type: LOAD_USER, address});
export const loadOffers = (address) => ({ type: LOAD_OFFERS, address });

export const addOffer = (seller) => ({
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
    arbitrator: seller.arbitrator
  }
});

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

export const updateUser = (user) => ({
  type: UPDATE_USER,
  user
});

export const resetUpdateUserStatus = () => ({
  type: RESET_UPDATE_USER_STATUS
});
