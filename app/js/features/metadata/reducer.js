import {
  LOAD_OFFERS_SUCCEEDED, LOAD_USER_SUCCEEDED,
  ADD_OFFER, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, RESET_ADD_OFFER_STATUS,
  UPDATE_USER, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, RESET_UPDATE_USER_STATUS
} from './constants';
import { States } from '../../utils/transaction';

const DEFAULT_STATE = {
  addOfferStatus: States.none,
  updateUserStatus: States.none,
  users: {},
  offers: {}
};

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
      const newOffers = state.offers[action.receipt.from.toLowerCase()].concat([action.offer]);
      return {
        ...state,
        addOfferStatus: States.success,
        users: {...state.users, [action.receipt.from.toLowerCase()]: action.user},
        offers: {...state.offers, [action.receipt.from.toLowerCase()]: newOffers}
      };
    }
    case ADD_OFFER_FAILED:
      return {
        ...state, addOfferStatus: States.fail
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
        users: {...state.users, [action.receipt.from.toLowerCase()]: action.user}
      };
    }
    case UPDATE_USER_FAILED:
      return {
        ...state, updateUserStatus: States.fail
      };
    case LOAD_USER_SUCCEEDED:
      return {
        ...state, users: {...state.users, [action.address.toLowerCase()]: action.user}
      };
    case LOAD_OFFERS_SUCCEEDED:
      return {
        ...state, offers: {...state.offers, [action.address.toLowerCase()]: action.offers}
      };
    default:
      return state;
  }
}

export default reducer;
