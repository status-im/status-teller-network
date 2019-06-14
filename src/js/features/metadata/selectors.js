import {PAYMENT_METHODS} from './constants';
import {addressCompare, toChecksumAddress} from '../../utils/address';

function enhanceOffer(state, offer) {
  let aboveOrBelow = 'above';
  let margin = offer.margin;
  if (offer.margin < 0) {
    aboveOrBelow = 'below';
    margin *= -1;
  }
  return {
    ...offer,
    paymentMethodsForHuman: offer.paymentMethods.map((i) => PAYMENT_METHODS[i]).join(', '),
    rateForHuman: `${margin}% ${aboveOrBelow} CryptoCompare`,
    token: Object.values(state.network.tokens).find((token) => addressCompare(token.address, offer.asset))
  };
}

export const getProfile = (state, address) => {
  if (!address) {
    return null;
  }
  const lAddress = toChecksumAddress(address);

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

export const getAddOfferTx = state => state.metadata.addOfferTx;

export const isSigning = state => state.metadata.signing;

export const getSignature = state => state.metadata.signature;

export const getNonce = state => state.metadata.nonce;
