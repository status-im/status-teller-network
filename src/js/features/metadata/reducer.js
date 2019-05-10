import {
  LOAD_OFFERS_SUCCEEDED, LOAD_USER_SUCCEEDED,
  ADD_OFFER, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, RESET_ADD_OFFER_STATUS,
  UPDATE_USER, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, RESET_UPDATE_USER_STATUS,
  LOAD_USER_LOCATION_SUCCEEDED
} from './constants';
import {USER_RATING_SUCCEEDED, CREATE_ESCROW_SUCCEEDED} from '../escrow/constants';
import { States } from '../../utils/transaction';

const DEFAULT_STATE = {
  addOfferStatus: States.none,
  updateUserStatus: States.none,
  users: {},
  offers: {}
};

function formatOffer(offer) {
  return {
    ...offer,
    id: parseInt(offer.id, 10),
    paymentMethods: offer.paymentMethods.map((i) => parseInt(i, 10)),
    owner: offer.owner.toLowerCase(),
    asset: offer.asset.toLowerCase()
  };
}

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_ADD_OFFER_STATUS:
      return {
        ...state, addOfferStatus: States.none
      };
    case ADD_OFFER:
      return {
        ...state, addOfferStatus: States.pending
      };
    case ADD_OFFER_SUCCEEDED: {
      return {
        ...state,
        addOfferStatus: States.success,
        users: {...state.users, [action.receipt.from.toLowerCase()]: action.user}
      };
    }
    case ADD_OFFER_FAILED:
      return {
        ...state, addOfferStatus: States.failed
      };
    case RESET_UPDATE_USER_STATUS:
      return {
        ...state, updateUserStatus: States.none
      };
    case UPDATE_USER:
      return {
        ...state, updateUserStatus: States.pending
      };
    case UPDATE_USER_SUCCEEDED: {
      return {
        ...state,
        updateUserStatus: States.success,
        users: {...state.users, [action.receipt.from.toLowerCase()]: {
          ...state.users[action.address.toLowerCase()],
          ...action.user
        }}
      };
    }
    case UPDATE_USER_FAILED:
      return {
        ...state, updateUserStatus: States.failed
      };
    case LOAD_USER_SUCCEEDED:
      return {
        ...state, users: {...state.users, [action.address.toLowerCase()]: {
          ...state.users[action.address.toLowerCase()],
          ...action.user
        }}
      };
    case LOAD_USER_LOCATION_SUCCEEDED:
      return {
        ...state, users: {...state.users, [action.address.toLowerCase()]: {
            ...state.users[action.address.toLowerCase()],
            coords: action.coords
          }
        }
      };
    case LOAD_OFFERS_SUCCEEDED: {
      const newOffers = action.offers.reduce((offers, offer) => {
        offers[offer.id] = formatOffer(offer);
        return offers;
      }, state.offers);

      return {
        ...state, offers: newOffers
      };
    }
    case USER_RATING_SUCCEEDED:
      return  {
        ...state, users: {...state.users, [action.address.toLowerCase()]: {
            ...state.users[action.address.toLowerCase()],
            downCount: action.downCount,
            upCount: action.upCount,
            voteCount: action.voteCount
          }
        }
      };
    case CREATE_ESCROW_SUCCEEDED: {
      return {
        ...state,
      users: {
          ...state.users,
          [action.user.buyerAddress.toLowerCase()]: {
            ...state.users[action.user.buyerAddress.toLowerCase()],
            statusContactCode: action.user.statusContactCode,
            username: action.user.username
          }
        }
      };
    }
    default:
      return state;
  }
}

export default reducer;
