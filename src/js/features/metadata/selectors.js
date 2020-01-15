import {PAYMENT_METHODS} from './constants';
import {addressCompare, toChecksumAddress} from '../../utils/address';

const emptyToken = {
  address: "?",
  decimals: 18,
  name: "?",
  symbol: "?"
};

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
    token: Object.values(state.network.tokens).find((token) => addressCompare(token.address, offer.asset)) || emptyToken
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

export const nextOfferPrice = (state) => state.metadata.offerPrice;

export const getAddOfferStatus = (state) => state.metadata.addOfferStatus;

export const getUpdateUserStatus = (state) => state.metadata.updateUserStatus;

export const currentUser = (state) => state.metadata.currentUser;

export const isEip1102Enabled = (state) => state.metadata.eip1102Enabled;

export const mainnetWarningShowed = (state) => state.metadata.mainnetWarningShowed;

export const getOfferById = (state, id) => {
  if (isNaN(id)) {
    return null;
  }
  const offer = enhanceOffer(state, state.metadata.offers[id]);
  return {...offer, user: state.metadata.users[offer.owner] || {}};
};

export const getOffersWithUser = (state) => {
  return Object.values(state.metadata.offers).filter(x => !x.deleted).map((offer) => ({
    ...enhanceOffer(state, offer),
    user: state.metadata.users[offer.owner] || {}
  }));
};

export const getUsersWithOffers = (state) => {
  return Object.keys(state.metadata.users).map((address) => ({
    ...state.metadata.users[address],
    address,
    offers: Object.values(state.metadata.offers).filter(offer => !offer.deleted && addressCompare(offer.owner, address))
  }));
};

export const getAllUsers = state => state.metadata.users;

export const getAddOfferTx = state => state.metadata.addOfferTx;

export const getDeleteOfferStatus = (state) => state.metadata.deleteOfferStatus;

export const txHash = state => state.metadata.txHash;

export const usingDefaultProvider = state => state.metadata.defaultProvider;
