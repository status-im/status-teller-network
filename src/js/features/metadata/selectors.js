import {PAYMENT_METHODS, MARKET_TYPES} from './constants';
import {addressCompare} from '../../utils/address';


function enhanceOffer(state, offer) {
  return {
    ...offer,
    paymentMethodsForHuman: offer.paymentMethods.map((i) => PAYMENT_METHODS[i]).join(', '),
    rateForHuman: `${offer.margin}% ${MARKET_TYPES[offer.marketType]} CryptoCompare`,
    token: Object.values(state.network.tokens).find((token) => addressCompare(token.address, offer.asset))
  };
}

export const getProfile = (state, address) => {
  const lAddress = address.toLowerCase();

  if (!state.metadata.users[lAddress]) {
    return null;
  }

  const offers = Object.values(state.metadata.offers).filter((offer) => addressCompare(offer.owner, lAddress)) || [];
  return {
    address: lAddress,
    ...state.metadata.users[lAddress],
    offers: offers.map(enhanceOffer.bind(null, state)),
    reputation: {upCount: state.metadata.users[lAddress].upCount, downCount: state.metadata.users[lAddress].downCount}
  };
};

export const getAddOfferStatus = (state) => {
  return state.metadata.addOfferStatus;
};

export const getUpdateUserStatus = (state) => {
  return state.metadata.updateUserStatus;
};

export const currentUser = (state) => {
  return state.metadata.currentUser;
};

export const getOfferById = (state, id) => {
  const offer = enhanceOffer(state, state.metadata.offers[id]);
  return {...offer, user: state.metadata.users[offer.owner] || {}};
};

export const getOffersWithUser = (state) => {
  return Object.values(state.metadata.offers).map((offer) => ({
    ...enhanceOffer(state, offer),
    user: state.metadata.users[offer.owner] || {}
  }));
};

export const getUsersWithOffers = (state) => {
  return Object.keys(state.metadata.users).map((address) => ({
    ...state.metadata.users[address],
    address,
    offers: Object.values(state.metadata.offers).filter(offer => addressCompare(offer.owner, address))
  }));
};

export const getAllUsers = state => state.metadata.users;
