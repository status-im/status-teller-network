import {
  LOAD, ADD_OFFER, RESET_ADD_OFFER_STATUS,
  UPDATE_USER, RESET_UPDATE_USER_STATUS, LOAD_OFFERS
} from './constants';

export const load = (address) => ({type: LOAD, address});
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
    marketType: seller.marketType,
    margin: seller.margin
  }
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
